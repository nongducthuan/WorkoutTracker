import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import type { ThemeColors } from '../../theme/colors';
import {
  useWorkouts,
  useUpcomingSchedules,
  useReports,
  useCurrentUser,
  useWorkoutSummaries,
  useWeeklyProgress,
} from '../../hooks';
import { DashboardSkeleton } from '../../../components/LoadingSkeleton';
import { ErrorState } from '../../../components/ErrorState';
import { EmptyState } from '../../../components/EmptyState';
import { initialsOf } from '../../utils/format';
import { formatFullDate, isSameDay } from '../../utils/date';

import { TodaySessionCard } from './components/TodaySessionCard';
import { StreakRow } from './components/StreakRow';
import { TodayScheduleList } from './components/TodayScheduleList';
import { TipCard } from './components/TipCard';
import { RestDayCard } from './components/RestDayCard';

type DashboardNav = NativeStackNavigationProp<RootStackParamList>;

/**
 * Design 02 · Trang chủ, with the design 10 (Ngày nghỉ phục hồi) variant when
 * nothing is scheduled for today.
 */
export default function DashboardScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<DashboardNav>();
  const { settings } = useSettings();

  const { workouts, isLoading: wLoading, isError: wError, refetch: refetchWorkouts } = useWorkouts();
  // The dashboard only shows today and what is next, so it asks for exactly
  // that instead of the account's whole schedule history.
  const { schedules, isLoading: sLoading, refetch: refetchSchedules } = useUpcomingSchedules();
  const { stats, isLoading: rLoading, refetch: refetchReports } = useReports();
  const { summaries } = useWorkoutSummaries();
  const { displayName } = useCurrentUser();
  const weeklyDone = useWeeklyProgress();

  const isLoading = wLoading || sLoading || rLoading;

  const todaysSchedules = useMemo(
    () => schedules.filter((s) => isSameDay(s.scheduledDate, new Date())),
    [schedules]
  );

  const activeToday = todaysSchedules.find((s) => !s.isCompleted);

  const nextSchedule = useMemo(
    () =>
      schedules
        .filter((s) => !s.isCompleted && new Date(s.scheduledDate) > new Date())
        .sort(
          (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
        )[0],
    [schedules]
  );

  const greeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return t('dashboard.greeting_morning');
    if (hrs < 18) return t('dashboard.greeting_afternoon');
    return t('dashboard.greeting_evening');
  };

  const refreshAll = () => {
    refetchWorkouts();
    refetchSchedules();
    refetchReports();
  };

  const styles = makeStyles(colors);

  if (isLoading) return <DashboardSkeleton />;
  if (wError) return <ErrorState onRetry={refreshAll} />;

  const summaryOf = (workoutId: string) => summaries.get(workoutId);
  const exerciseCountOf = (workoutId: string) => summaryOf(workoutId)?.exerciseCount ?? 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refreshAll} tintColor={colors.electric} />
        }
      >
        {/* Header: date, greeting, avatar */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.date}>{formatFullDate(new Date())}</Text>
            <Text style={styles.greeting}>
              {greeting()}
              {displayName ? ', ' : ''}
              <Text style={styles.greetingName}>{displayName}</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.avatarText}>{initialsOf(displayName)}</Text>
          </TouchableOpacity>
        </View>

        {workouts.length === 0 ? (
          <EmptyState
            iconName="list"
            title={t('workouts.empty_title')}
            description={t('workouts.empty_desc')}
            actionText={t('workouts.empty_action')}
            onAction={() => (navigation.getParent() as any)?.navigate('Workouts')}
          />
        ) : activeToday ? (
          <>
            <TodaySessionCard
              workoutName={activeToday.workoutName || t('notifications.workout')}
              exerciseCount={exerciseCountOf(activeToday.workoutId)}
              muscles={summaryOf(activeToday.workoutId)?.muscles ?? []}
              scheduledDate={activeToday.scheduledDate}
              onStart={() =>
                navigation.navigate('ActiveWorkout', { workoutId: activeToday.workoutId })
              }
            />
            <StreakRow
              streakDays={stats?.streakDays ?? 0}
              weeklyDone={weeklyDone}
              weeklyGoal={settings.weeklyGoal}
            />
            <TodayScheduleList
              schedules={todaysSchedules}
              exerciseCountOf={exerciseCountOf}
              onPressItem={(s) => navigation.navigate('WorkoutDetail', { id: s.workoutId })}
              onViewAll={() => (navigation.getParent() as any)?.navigate('Schedule')}
            />
            <TipCard />
          </>
        ) : (
          <>
            <StreakRow
              streakDays={stats?.streakDays ?? 0}
              weeklyDone={weeklyDone}
              weeklyGoal={settings.weeklyGoal}
            />
            <RestDayCard
              streakDays={stats?.streakDays ?? 0}
              nextSchedule={nextSchedule}
              onPressNext={() =>
                nextSchedule &&
                navigation.navigate('WorkoutDetail', { id: nextSchedule.workoutId })
              }
            />
          </>
        )}

        {/* Quick actions */}
        <View style={styles.quickRow}>
          {[
            { icon: 'user', label: t('dashboard.profile'), to: 'Profile' as const },
            { icon: 'bell', label: t('dashboard.notifications'), to: 'Notifications' as const },
            { icon: 'award', label: t('dashboard.achievements'), to: 'Achievements' as const },
          ].map((action) => (
            <TouchableOpacity
              key={action.to}
              style={styles.quickCard}
              onPress={() => navigation.navigate(action.to)}
            >
              <View style={styles.quickIcon}>
                <Icon name={action.icon as any} size={18} color={colors.onSurface} />
              </View>
              <Text style={styles.quickText} numberOfLines={2}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    date: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.mutedGray,
    },
    greeting: { fontSize: 24, fontWeight: '900', color: colors.onSurface, marginTop: 6 },
    greetingName: { color: colors.electric },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 2,
      borderColor: colors.electric,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontSize: 14, fontWeight: '900', color: colors.electric },
    quickRow: { flexDirection: 'row', gap: 12 },
    quickCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
    },
    quickIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    quickText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.onSurface,
      textAlign: 'center',
    },
  });
