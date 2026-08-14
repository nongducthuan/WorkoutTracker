import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import {
  useWorkouts,
  useUpcomingSchedules,
  useExercises,
  useWorkoutSummaries,
} from '../../hooks';
import { DashboardSkeleton } from '../../../components/LoadingSkeleton';
import { ErrorState } from '../../../components/ErrorState';
import { EmptyState } from '../../../components/EmptyState';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { isSameDay } from '../../utils/date';

import { WorkoutCard } from './components/WorkoutCard';
import { WorkoutFormModal, WorkoutFormValues } from './components/WorkoutFormModal';

type WorkoutsNav = NativeStackNavigationProp<RootStackParamList>;

/** Design 03 · Bài tập của tôi (and design 09 · Empty state). */
export default function WorkoutsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<WorkoutsNav>();

  const { workouts, isLoading, isError, refetch, createWorkout, deleteWorkout, isCreating } =
    useWorkouts();
  // Only used to mark which routines are on today's plan.
  const { schedules } = useUpcomingSchedules();
  const { exercises } = useExercises();
  const { summaries } = useWorkoutSummaries();

  const [isFormOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const muscleOptions = useMemo(
    () => Array.from(new Set(exercises.map((e) => e.category).filter(Boolean) as string[])),
    [exercises]
  );

  const scheduledTodayIds = useMemo(
    () =>
      new Set(
        schedules
          .filter((s) => !s.isCompleted && isSameDay(s.scheduledDate, new Date()))
          .map((s) => s.workoutId)
      ),
    [schedules]
  );

  const handleCreate = async (values: WorkoutFormValues) => {
    // Muscle groups have no column on the API, so they ride along in the
    // description where they stay visible to the user.
    const description = values.muscles.length
      ? [values.description, values.muscles.join(' · ')].filter(Boolean).join('\n')
      : values.description;

    await createWorkout({ name: values.name, description });
    setFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteWorkout(deleteId);
    setDeleteId(null);
  };

  const styles = makeStyles(colors);

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{t('workouts.title')}</Text>
            <Text style={styles.subtitle}>
              {t('workouts.count_subtitle', { count: workouts.length })}
            </Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setFormOpen(true)}>
            <Icon name="plus" size={20} color={colors.black} />
          </TouchableOpacity>
        </View>

        {workouts.length === 0 ? (
          <EmptyState
            iconName="clipboard"
            title={t('workouts.empty_title')}
            description={t('workouts.empty_desc')}
            actionText={t('workouts.empty_action')}
            onAction={() => setFormOpen(true)}
            secondaryText={t('workouts.empty_secondary')}
            onSecondary={() => (navigation.getParent() as any)?.navigate('Exercises')}
          />
        ) : (
          workouts.map((w) => {
            const summary = summaries.get(w.id);
            return (
              <WorkoutCard
                key={w.id}
                workout={w}
                exerciseCount={summary?.exerciseCount ?? 0}
                muscles={summary?.muscles ?? []}
                lastPerformed={summary?.lastPerformed}
                isToday={scheduledTodayIds.has(w.id)}
                onPress={() => navigation.navigate('WorkoutDetail', { id: w.id })}
                onDelete={() => setDeleteId(w.id)}
              />
            );
          })
        )}
      </ScrollView>

      <WorkoutFormModal
        isOpen={isFormOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        muscleOptions={muscleOptions}
        isSaving={isCreating}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        title={t('workouts.delete_title')}
        message={t('workouts.delete_message')}
        confirmText={t('workouts.delete_button')}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 22,
    },
    headerText: { flex: 1 },
    title: { fontSize: 26, fontWeight: '900', color: colors.onSurface },
    subtitle: { fontSize: 12, color: colors.mutedGray, marginTop: 4 },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.electric,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
