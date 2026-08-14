import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import {
  useWorkout,
  useWorkoutExercises,
  useExercises,
  useComments,
  useWorkoutSchedules,
} from '../../hooks';
import { DashboardSkeleton } from '../../../components/LoadingSkeleton';
import { ErrorState } from '../../../components/ErrorState';
import { EmptyState } from '../../../components/EmptyState';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { SectionLabel } from '../../../components/ui';
import { isSameDay } from '../../utils/date';

import { NextScheduleCard } from './components/NextScheduleCard';
import { ExerciseRow } from './components/ExerciseRow';
import { NotesSection } from './components/NotesSection';
import { ScheduleSection } from './components/ScheduleSection';
import { ExerciseFormModal, ExerciseFormValues } from './components/ExerciseFormModal';
import { ScheduleFormModal, ScheduleFormValues } from './components/ScheduleFormModal';
import { WorkoutExercise } from '../../types';

type DetailRoute = RouteProp<RootStackParamList, 'WorkoutDetail'>;
type DetailNav = NativeStackNavigationProp<RootStackParamList>;

/** Design 04 · Chi tiết buổi tập. */
export default function WorkoutDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation<DetailNav>();
  const workoutId = route.params?.id || '';

  const { workout, isLoading, isError, refetch } = useWorkout(workoutId);
  const {
    workoutExercises,
    addExercise,
    updateExercise,
    deleteExercise,
    isAdding,
    isUpdating,
  } = useWorkoutExercises(workoutId);
  const { exercises: library } = useExercises();
  const { comments, addComment, updateComment, deleteComment, isAdding: isPosting } =
    useComments(workoutId);
  const { schedules, scheduleWorkout, deleteSchedule, isScheduling } =
    useWorkoutSchedules(workoutId);

  const [editingExercise, setEditingExercise] = useState<WorkoutExercise | null>(null);
  const [isExerciseFormOpen, setExerciseFormOpen] = useState(false);
  const [isScheduleFormOpen, setScheduleFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<
    { type: 'exercise' | 'comment' | 'schedule'; id: string } | null
  >(null);

  const sortedSchedules = useMemo(
    () =>
      [...schedules].sort(
        (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      ),
    [schedules]
  );

  const nextSchedule = useMemo(
    () => sortedSchedules.find((s) => !s.isCompleted),
    [sortedSchedules]
  );

  const estimatedMinutes = Math.max(10, workoutExercises.length * 9);

  const handleSubmitExercise = async (values: ExerciseFormValues) => {
    const payload = {
      workoutId,
      exerciseId: values.exerciseId,
      sets: values.sets,
      repetitions: values.repetitions,
      weight: values.weight,
    };
    if (editingExercise) {
      await updateExercise({ id: editingExercise.id, data: payload });
    } else {
      await addExercise(payload as any);
    }
    setExerciseFormOpen(false);
    setEditingExercise(null);
  };

  const handleSubmitSchedule = async (values: ScheduleFormValues) => {
    await scheduleWorkout(values.scheduledDate, values.remind);
    // "Hàng tuần" creates the next three weekly occurrences up front — the API
    // stores single dates, so recurrence is expanded on the client.
    if (values.repeatWeekly) {
      for (let week = 1; week <= 3; week += 1) {
        const next = new Date(values.scheduledDate);
        next.setDate(next.getDate() + week * 7);
        await scheduleWorkout(next.toISOString(), values.remind);
      }
    }
    setScheduleFormOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === 'exercise') await deleteExercise(pendingDelete.id);
    if (pendingDelete.type === 'comment') await deleteComment(pendingDelete.id);
    if (pendingDelete.type === 'schedule') await deleteSchedule(pendingDelete.id);
    setPendingDelete(null);
  };

  const styles = makeStyles(colors);

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!workout) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScreenHeader title={t('workouts.title')} />
        <EmptyState
          iconName="alert-circle"
          title={t('workouts.empty_title')}
          description={t('workouts.empty_desc')}
          actionText={t('common.back')}
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title={workout.name}
          subtitle={`${t('workouts.exercise_count', { count: workoutExercises.length })} · ${t(
            'workout_detail.approx_duration',
            { count: estimatedMinutes }
          )}`}
        />

        <NextScheduleCard
          schedule={nextSchedule}
          canStart={workoutExercises.length > 0}
          onStart={() => navigation.navigate('ActiveWorkout', { workoutId })}
          onSchedule={() => setScheduleFormOpen(true)}
        />

        <View style={styles.listHeader}>
          <SectionLabel>{t('workout_detail.exercise_list')}</SectionLabel>
          <TouchableOpacity
            onPress={() => {
              setEditingExercise(null);
              setExerciseFormOpen(true);
            }}
          >
            <Text style={styles.addText}>{t('workout_detail.add_exercise_short')}</Text>
          </TouchableOpacity>
        </View>

        {workoutExercises.length === 0 ? (
          <EmptyState
            iconName="plus-circle"
            title={t('workout_detail.no_exercises')}
            description={t('workout_detail.no_exercises_desc')}
            actionText={t('workout_detail.add_first_exercise')}
            onAction={() => setExerciseFormOpen(true)}
          />
        ) : (
          workoutExercises.map((ex, idx) => (
            <ExerciseRow
              key={ex.id}
              index={idx + 1}
              exercise={ex}
              onPress={() =>
                navigation.navigate('ExerciseDetail', {
                  exerciseId: ex.exerciseId,
                  workoutId,
                })
              }
              onEdit={() => {
                setEditingExercise(ex);
                setExerciseFormOpen(true);
              }}
              onDelete={() => setPendingDelete({ type: 'exercise', id: ex.id })}
            />
          ))
        )}

        <ScheduleSection
          schedules={sortedSchedules}
          onAdd={() => setScheduleFormOpen(true)}
          onDelete={(id) => setPendingDelete({ type: 'schedule', id })}
        />

        <View style={styles.notesWrap}>
          <NotesSection
            comments={comments}
            onAdd={addComment}
            onUpdate={(id, comment) => updateComment({ id, comment })}
            onDelete={(id) => setPendingDelete({ type: 'comment', id })}
            isPosting={isPosting}
          />
        </View>
      </ScrollView>

      <ExerciseFormModal
        isOpen={isExerciseFormOpen}
        onClose={() => {
          setExerciseFormOpen(false);
          setEditingExercise(null);
        }}
        onSubmit={handleSubmitExercise}
        library={library}
        editing={editingExercise}
        isSaving={isAdding || isUpdating}
      />

      <ScheduleFormModal
        isOpen={isScheduleFormOpen}
        onClose={() => setScheduleFormOpen(false)}
        onSubmit={handleSubmitSchedule}
        workoutName={workout.name}
        workoutMeta={`${t('workouts.exercise_count', {
          count: workoutExercises.length,
        })} · ${t('workout_detail.approx_duration', { count: estimatedMinutes })}`}
        isSaving={isScheduling}
      />

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title={t('workout_detail.delete_exercise_title')}
        message={t('workout_detail.delete_exercise_message')}
        confirmText={t('common.delete')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      {!!nextSchedule && isSameDay(nextSchedule.scheduledDate, new Date()) && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('ActiveWorkout', { workoutId })}
        >
          <Icon name="play" size={20} color={colors.black} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 48 },
    listHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    addText: {
      fontSize: 12,
      fontWeight: '900',
      color: colors.electric,
      textTransform: 'uppercase',
      marginBottom: 12,
    },
    notesWrap: { marginTop: 24 },
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 28,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.electric,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 6,
    },
  });
