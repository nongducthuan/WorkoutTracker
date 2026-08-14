import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { useSettings } from '../../context/SettingsContext';
import { useReports, useMuscleLoad, useWeeklyProgress } from '../../hooks';
import { DashboardSkeleton } from '../../../components/LoadingSkeleton';
import { ErrorState } from '../../../components/ErrorState';
import { EmptyState } from '../../../components/EmptyState';
import { StatCard } from '../../../components/ui';
import { toTons } from '../../utils/format';

import { VolumeChart, VolumeBar } from './components/VolumeChart';
import { MuscleLoadSection } from './components/MuscleLoadSection';
import { RecentActivity } from './components/RecentActivity';

type ReportsNav = NativeStackNavigationProp<RootStackParamList>;

/** Design 07 · Báo cáo, including the 07b muscle-load block. */
export default function ReportsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<ReportsNav>();
  const { settings } = useSettings();

  const { stats, isLoading, isError, refetch } = useReports();
  const { entries } = useMuscleLoad(7);
  const weeklyDone = useWeeklyProgress();

  const bars = useMemo<VolumeBar[]>(() => {
    const weekly = stats?.weeklyWorkouts || [];
    return weekly.slice(-6).map((w: any) => ({
      label: typeof w.week === 'string' ? w.week : `T${w.week}`,
      volume: w.volume || 0,
    }));
  }, [stats]);

  const activity = useMemo(
    () =>
      (stats?.recentActivity || []).map((a: any) => ({
        id: a.id,
        date: a.date,
        workoutName: a.workoutName,
        exercisesCount: a.exercisesCount,
      })),
    [stats]
  );

  const styles = makeStyles(colors);

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const hasData = (stats?.totalWorkouts || 0) > 0;
  /**
   * The server falls back to reading completed schedules when the account has
   * logged no session yet, which assumes every planned set was performed as
   * written. Saying so is the difference between a measurement and a guess.
   */
  const isEstimated = stats?.source === 'schedules';

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.electric} />
        }
      >
        <Text style={styles.title}>{t('reports.title')}</Text>

        {!hasData ? (
          <EmptyState
            iconName="bar-chart-2"
            title={t('reports.empty_activity_title')}
            description={t('reports.empty_activity_desc')}
            actionText={t('workouts.title')}
            onAction={() => (navigation.getParent() as any)?.navigate('Workouts')}
          />
        ) : (
          <>
            {isEstimated && (
              <View style={styles.notice}>
                <Icon name="info" size={16} color={colors.warning} />
                <Text style={styles.noticeText}>{t('reports.estimated_notice')}</Text>
              </View>
            )}

            <View style={styles.statsGrid}>
              <StatCard
                label={t('reports.total_sessions')}
                value={stats?.totalWorkouts ?? 0}
                icon="calendar"
              />
              <StatCard
                label={t('reports.total_volume')}
                value={toTons(stats?.totalVolume ?? 0)}
                unit={t('achievements.tons_unit')}
                icon="trending-up"
                highlight
              />
            </View>
            <View style={styles.statsGrid}>
              <StatCard
                label={t('dashboard.streak_label')}
                value={stats?.streakDays ?? 0}
                unit={t('dashboard.streak_unit')}
                icon="zap"
              />
              <StatCard
                label={t('reports.this_week_label')}
                value={weeklyDone}
                unit={`/${settings.weeklyGoal}`}
                icon="target"
              />
            </View>
            <View style={styles.statsGrid}>
              <StatCard
                label={t('reports.total_sets')}
                value={stats?.totalSets ?? 0}
                icon="layers"
              />
              {/* A schedules-based report carries no duration at all, so the
                  card would read "0 phút" — show the real gap instead. */}
              <StatCard
                label={t('reports.avg_duration')}
                value={
                  isEstimated || !stats?.avgDurationSec
                    ? '—'
                    : Math.round(stats.avgDurationSec / 60)
                }
                unit={
                  isEstimated || !stats?.avgDurationSec ? undefined : t('common.minutes_short')
                }
                icon="clock"
              />
            </View>

            <VolumeChart bars={bars} />

            <MuscleLoadSection
              entries={entries}
              onOpenFullMap={() => navigation.navigate('MuscleMapFull')}
            />

            <RecentActivity items={activity} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    title: { fontSize: 26, fontWeight: '900', color: colors.onSurface, marginBottom: 20 },
    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    notice: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.warning,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
    },
    noticeText: { flex: 1, fontSize: 11, lineHeight: 16, color: colors.mutedGray },
  });
