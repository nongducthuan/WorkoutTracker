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
import { useSettings } from '../../context/SettingsContext';
import {
  useWorkout,
  useWorkoutExercises,
  useActiveWorkout,
  usePersonalRecords,
  useWorkoutSchedules,
} from '../../hooks';
import { DashboardSkeleton } from '../../../components/LoadingSkeleton';
import { EmptyState } from '../../../components/EmptyState';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { PrimaryButton, ProgressBar } from '../../../components/ui';
import { formatDuration, isSameDay } from '../../utils/date';
import { formatWeight } from '../../utils/format';

import { SetRow } from './components/SetRow';
import { RestBar } from './components/RestBar';

type ActiveRoute = RouteProp<RootStackParamList, 'ActiveWorkout'>;
type ActiveNav = NativeStackNavigationProp<RootStackParamList>;

/** Design 04b · Đang tập (Active Workout). */
export default function ActiveWorkoutScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const route = useRoute<ActiveRoute>();
  const navigation = useNavigation<ActiveNav>();
  const { settings } = useSettings();
  const workoutId = route.params?.workoutId || '';

  const { workout, isLoading } = useWorkout(workoutId);
  const { workoutExercises, isLoading: exLoading } = useWorkoutExercises(workoutId);
  const { records } = usePersonalRecords();
  const { schedules } = useWorkoutSchedules(workoutId);

  const previousPrs = useMemo(
    () => new Map(records.map((r) => [r.exerciseId, r.weight])),
    [records]
  );

  const session = useActiveWorkout(workoutId, workoutExercises, previousPrs);
  const [isExitOpen, setExitOpen] = useState(false);

  const todaySchedule = useMemo(
    () => schedules.find((s) => !s.isCompleted && isSameDay(s.scheduledDate, new Date())),
    [schedules]
  );

  const styles = makeStyles(colors);

  if (isLoading || exLoading) return <DashboardSkeleton />;

  if (workoutExercises.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <EmptyState
          iconName="alert-circle"
          title={t('active_workout.no_exercises')}
          description={t('workout_detail.no_exercises_desc')}
          actionText={t('common.back')}
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const current = session.currentExercise;
  const next = session.nextExercise;
  const doneForCurrent = current ? session.completedSets[current.id] || [] : [];

  const finish = () => {
    // One row per set the user actually ticked. Reps and weight come from the
    // routine because that is what the set sheet showed them; the server stores
    // them as performed rather than re-deriving them from the plan later.
    const performedSets = workoutExercises.flatMap((we) =>
      (session.completedSets[we.id] || [])
        .map((done, index) => (done ? index : -1))
        .filter((index) => index >= 0)
        .map((index) => ({
          exerciseId: we.exerciseId,
          setIndex: index + 1,
          reps: we.repetitions,
          weight: we.weight || 0,
        }))
    );

    navigation.replace('WorkoutSummary', {
      workoutId,
      durationSeconds: session.summary.durationSeconds,
      totalVolume: session.summary.totalVolume,
      prCount: session.summary.prCount,
      exercises: session.summary.completedExercises,
      scheduleId: todaySchedule?.id,
      startedAt: new Date(session.startedAt).toISOString(),
      sets: performedSets,
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {/* Top bar: close · name · elapsed · finish */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setExitOpen(true)} style={styles.iconBtn} hitSlop={8}>
          <Icon name="x" size={20} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.topText}>
          <Text style={styles.workoutName} numberOfLines={1}>
            {workout?.name}
          </Text>
          <Text style={styles.elapsed}>{formatDuration(session.elapsed)}</Text>
        </View>
        <TouchableOpacity onPress={finish}>
          <Text style={styles.finish}>{t('active_workout.finish')}</Text>
        </TouchableOpacity>
      </View>

      <ProgressBar
        value={session.totalSets ? session.completedSetCount / session.totalSets : 0}
        style={styles.progress}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.stepLabel}>
          {t('active_workout.exercise_progress', {
            current: session.currentIndex + 1,
            total: workoutExercises.length,
          })}
        </Text>

        {!!current && (
          <>
            <Text style={styles.exerciseName}>
              {current.exerciseName || `#${current.exerciseId}`}
            </Text>
            <Text style={styles.exerciseWeight}>
              {formatWeight(current.weight || 0, settings.weightUnit)}
            </Text>

            <View style={styles.setList}>
              {Array.from({ length: current.sets }).map((_, idx) => (
                <SetRow
                  key={idx}
                  index={idx + 1}
                  reps={current.repetitions}
                  weightLabel={formatWeight(current.weight || 0, settings.weightUnit)}
                  done={!!doneForCurrent[idx]}
                  onToggle={() => session.toggleSet(current.id, idx, current.sets)}
                />
              ))}
            </View>
          </>
        )}

        {!!next && (
          <View style={styles.nextCard}>
            <Text style={styles.nextLabel}>{t('active_workout.next_up')}</Text>
            <Text style={styles.nextName}>{next.exerciseName || `#${next.exerciseId}`}</Text>
            <Text style={styles.nextMeta}>
              {next.sets} × {next.repetitions} ·{' '}
              {formatWeight(next.weight || 0, settings.weightUnit)}
            </Text>
          </View>
        )}

        {session.isComplete && (
          <PrimaryButton
            label={t('summary.save_finish')}
            icon="check"
            onPress={finish}
            style={styles.completeBtn}
          />
        )}
      </ScrollView>

      {session.isResting && session.restSeconds !== null && (
        <View style={styles.restWrap}>
          <RestBar
            secondsLeft={session.restSeconds}
            onExtend={() => session.extendRest(30)}
            onSkip={session.skipRest}
          />
        </View>
      )}

      <ConfirmDialog
        isOpen={isExitOpen}
        title={t('active_workout.exit_title')}
        message={t('active_workout.exit_message')}
        confirmText={t('active_workout.exit_confirm')}
        isDanger={false}
        onCancel={() => setExitOpen(false)}
        onConfirm={() => {
          setExitOpen(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topText: { flex: 1, alignItems: 'center' },
    workoutName: { fontSize: 13, fontWeight: '800', color: colors.mutedGray },
    elapsed: { fontSize: 20, fontWeight: '900', color: colors.onSurface, marginTop: 2 },
    finish: {
      fontSize: 13,
      fontWeight: '900',
      color: colors.electric,
      textTransform: 'uppercase',
    },
    progress: { marginHorizontal: 20 },
    content: { padding: 20, paddingBottom: 140 },
    stepLabel: {
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.mutedGray,
      marginTop: 8,
    },
    exerciseName: { fontSize: 26, fontWeight: '900', color: colors.onSurface, marginTop: 8 },
    exerciseWeight: { fontSize: 15, fontWeight: '800', color: colors.electric, marginTop: 6 },
    setList: { marginTop: 22 },
    nextCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
      marginTop: 12,
    },
    nextLabel: {
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.mutedGray,
    },
    nextName: { fontSize: 15, fontWeight: '800', color: colors.onSurface, marginTop: 6 },
    nextMeta: { fontSize: 12, color: colors.mutedGray, marginTop: 4 },
    completeBtn: { marginTop: 24 },
    restWrap: {
      position: 'absolute',
      left: 20,
      right: 20,
      bottom: 24,
    },
  });
