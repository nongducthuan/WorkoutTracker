import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { useTranslation } from 'react-i18next';

import { useReports } from '../hooks/useFitnessData';
import { DashboardSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { MuscleMap } from '../../components/MuscleMap';
import { MuscleId, getMuscleLabel } from '../lib/muscleMap';
import { Colors } from '../theme/colors';
import { globalStyles } from '../theme/styles';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { stats, isLoading } = useReports();
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('weekly');

  const formatVolume = (val: number) => {
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}t`;
    }
    return `${val}kg`;
  };

  const heatmapData = useMemo(() => {
    if (!stats || !stats.recentActivity) return {};

    const musclesScore: Record<MuscleId, number> = {} as Record<MuscleId, number>;
    const now = Date.now();
    const cutoffDays = timeRange === 'weekly' ? 7 : 30;

    stats.recentActivity.forEach((act) => {
      const actDate = new Date(act.date).getTime();
      const diffDays = (now - actDate) / (1000 * 60 * 60 * 24);

      if (diffDays > cutoffDays) return;

      const name = act.workoutName.toLowerCase();
      const multiplier = act.exercisesCount || 1;

      const addScore = (muscle: MuscleId, val: number) => {
        musclesScore[muscle] = (musclesScore[muscle] || 0) + val * multiplier;
      };

      if (name.includes('chest') || name.includes('push')) {
        addScore('chest', 1.0);
        addScore('front-deltoid', 0.8);
        addScore('triceps', 0.8);
        addScore('trapezius-front', 0.4);
      } else if (name.includes('back') || name.includes('pull')) {
        addScore('lats', 1.0);
        addScore('biceps', 0.8);
        addScore('trapezius-back', 0.8);
        addScore('rear-deltoid', 0.6);
      } else if (name.includes('leg') || name.includes('squat') || name.includes('lower')) {
        addScore('quadriceps', 1.0);
        addScore('glutes', 0.9);
        addScore('hamstrings', 0.8);
        addScore('calves', 0.6);
        addScore('tibialis', 0.4);
      } else if (name.includes('shoulder') || name.includes('press')) {
        addScore('front-deltoid', 1.0);
        addScore('rear-deltoid', 0.8);
        addScore('trapezius-front', 0.6);
        addScore('triceps', 0.4);
      } else if (name.includes('core') || name.includes('abs') || name.includes('midsection')) {
        addScore('abs', 1.0);
        addScore('obliques', 0.8);
      } else {
        addScore('chest', 0.5);
        addScore('lats', 0.5);
        addScore('quadriceps', 0.5);
      }
    });

    const maxVal = Math.max(...Object.values(musclesScore), 1);
    const scaledScore: Partial<Record<MuscleId, number>> = {};
    
    Object.entries(musclesScore).forEach(([key, val]) => {
      scaledScore[key as MuscleId] = val / maxVal;
    });

    return {
      raw: musclesScore,
      scaled: scaledScore,
    };
  }, [stats, timeRange]);

  const rankedMuscles = useMemo(() => {
    if (!heatmapData.raw) return [];
    return Object.entries(heatmapData.raw)
      .map(([muscleId, volume]) => ({
        id: muscleId as MuscleId,
        name: getMuscleLabel(muscleId as MuscleId),
        volume: Math.round(volume * 10), 
      }))
      .sort((a, b) => b.volume - a.volume);
  }, [heatmapData]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!stats || stats.totalWorkouts === 0) {
    return (
      <View style={[globalStyles.screen, { paddingTop: 40, paddingHorizontal: 20 }]}>
        <EmptyState
          title={t('reports.empty_activity_title')}
          description={t('reports.empty_activity_desc')}
          actionText="Go to workouts →"
          onAction={() => navigation.navigate('Workouts')}
          icon={<Feather name="bar-chart-2" size={32} color={Colors.mutedGray} />}
        />
      </View>
    );
  }

  const totalVolumeTons = (stats.totalVolume / 1000).toFixed(1);

  const barData = (stats.weeklyWorkouts || []).map(w => ({
    value: w.count,
    label: w.week,
    frontColor: Colors.electric,
    labelTextStyle: { color: Colors.mutedGray, fontSize: 10, fontWeight: 'bold' as const }
  }));

  const lineData = (stats.weeklyWorkouts || []).map(w => ({
    value: w.volume,
    label: w.week,
    labelTextStyle: { color: Colors.mutedGray, fontSize: 10, fontWeight: 'bold' as const }
  }));

  const chartWidth = screenWidth - 80; 

  return (
    <ScrollView style={globalStyles.screen} contentContainerStyle={{ padding: 20 }}>
      {/* Background blur effect simulation */}
      <View style={styles.blurEffect} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t('reports.title')}
        </Text>
        <Text style={styles.headerSubtitle}>
          {t('reports.subtitle')}
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={{ marginBottom: 32 }}>
        {/* Workouts */}
        <View style={[globalStyles.card, { marginBottom: 16 }]}>
          <Text style={styles.cardLabel}>
            {t('reports.workouts_logged')}
          </Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsValueMain}>
              {stats.totalWorkouts}
            </Text>
            <View style={styles.badgeElectric}>
              <Text style={styles.badgeTextElectric}>
                {t('reports.steady')}
              </Text>
            </View>
          </View>
          <View style={styles.subStatsRow}>
            <Feather name="calendar" size={12} color={Colors.mutedGray} />
            <Text style={styles.subStatsText}>
              {t('reports.past_sessions')}
            </Text>
          </View>
        </View>

        {/* Volume */}
        <View style={[globalStyles.card, { marginBottom: 16 }]}>
          <Text style={styles.cardLabel}>
            {t('reports.tonnage_lifted')}
          </Text>
          <View style={styles.statsRow}>
            <Text style={[styles.statsValueMain, { color: Colors.electric }]}>
              {totalVolumeTons} <Text style={styles.statsValueUnit}>{t('reports.tons')}</Text>
            </Text>
            <View style={styles.badgeOrange}>
              <Text style={styles.badgeTextOrange}>
                {t('reports.high_load')}
              </Text>
            </View>
          </View>
          <View style={styles.subStatsRow}>
            <Feather name="trending-up" size={12} color={Colors.mutedGray} />
            <Text style={styles.subStatsText}>
              {t('reports.tonnage_formula')}
            </Text>
          </View>
        </View>

        {/* Streak */}
        <View style={globalStyles.card}>
          <Text style={styles.cardLabel}>
            {t('reports.split_consistency')}
          </Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsValueMain}>
              {stats.streakDays} <Text style={styles.statsValueUnit}>{t('reports.days')}</Text>
            </Text>
            <View style={styles.badgeElectric}>
              <Text style={styles.badgeTextElectric}>
                {t('reports.active')}
              </Text>
            </View>
          </View>
          <View style={styles.subStatsRow}>
            <Feather name="activity" size={12} color={Colors.electricOrange} />
            <Text style={styles.subStatsText}>
              {t('reports.consecutive_freq')}
            </Text>
          </View>
        </View>
      </View>

      {/* Charts */}
      <View style={{ marginBottom: 32 }}>
        {/* Session frequency Chart */}
        <View style={[globalStyles.card, { marginBottom: 24 }]}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <Feather name="bar-chart-2" size={16} color={Colors.electric} />
              <Text style={styles.chartTitleText}>
                {t('reports.session_frequency')}
              </Text>
            </View>
            <View style={[styles.badgeElectric, { backgroundColor: 'rgba(198, 244, 50, 0.15)' }]}>
              <Text style={[styles.badgeTextElectric, { fontSize: 10 }]}>
                {t('reports.workouts_per_week')}
              </Text>
            </View>
          </View>
          <View style={styles.chartContainer}>
             {barData.length > 0 ? (
                <BarChart
                  data={barData}
                  barWidth={24}
                  noOfSections={4}
                  barBorderRadius={4}
                  frontColor={Colors.electric}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  hideRules={true}
                  yAxisTextStyle={{ color: Colors.mutedGray, fontSize: 10, fontWeight: 'bold' }}
                  isAnimated
                  width={chartWidth}
                  height={150}
                  disableScroll={true}
                />
             ) : (
                <Text style={styles.noDataText}>No Data</Text>
             )}
          </View>
        </View>

        {/* Volume progression Chart */}
        <View style={globalStyles.card}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <Feather name="activity" size={16} color={Colors.electricOrange} />
              <Text style={styles.chartTitleText}>
                {t('reports.volume_progression')}
              </Text>
            </View>
            <View style={[styles.badgeOrange, { backgroundColor: 'rgba(255, 107, 53, 0.15)' }]}>
              <Text style={[styles.badgeTextOrange, { fontSize: 10 }]}>
                {t('reports.tonnage_curve')}
              </Text>
            </View>
          </View>
          <View style={styles.chartContainer}>
            {lineData.length > 0 ? (
              <LineChart
                data={lineData}
                areaChart
                hideDataPoints
                color={Colors.electricOrange}
                startFillColor={Colors.electricOrange}
                endFillColor={Colors.electricOrange}
                startOpacity={0.2}
                endOpacity={0}
                thickness={2}
                yAxisThickness={0}
                xAxisThickness={0}
                hideRules={true}
                yAxisTextStyle={{ color: Colors.mutedGray, fontSize: 10, fontWeight: 'bold' }}
                isAnimated
                width={chartWidth}
                height={150}
                disableScroll={true}
                formatYLabel={(val) => {
                  const num = Number(val);
                  if (num >= 1000) return `${(num / 1000).toFixed(0)}t`;
                  return `${num}`;
                }}
              />
            ) : (
              <Text style={styles.noDataText}>No Data</Text>
            )}
          </View>
        </View>
      </View>

      {/* Heatmap & Leaderboard */}
      <View style={[globalStyles.card, { marginBottom: 32 }]}>
        <View style={styles.scannerHeader}>
          <View>
            <View style={styles.scannerTitleRow}>
              <Feather name="target" size={18} color={Colors.electric} />
              <Text style={styles.scannerTitleText}>
                {t('reports.scanner_title')}
              </Text>
            </View>
            <Text style={styles.scannerSubtitleText}>
              {t('reports.scanner_desc')}
            </Text>
          </View>

          {/* Time Range Toggle */}
          <View style={styles.timeToggleContainer}>
            <TouchableOpacity
              onPress={() => setTimeRange('weekly')}
              style={[styles.timeToggleBtn, timeRange === 'weekly' && styles.timeToggleBtnActive]}
            >
              <Text style={[styles.timeToggleText, timeRange === 'weekly' && styles.timeToggleTextActive]}>
                {t('reports.weekly_split')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTimeRange('monthly')}
              style={[styles.timeToggleBtn, timeRange === 'monthly' && styles.timeToggleBtnActive]}
            >
              <Text style={[styles.timeToggleText, timeRange === 'monthly' && styles.timeToggleTextActive]}>
                {t('reports.monthly_split')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Heatmap container */}
        <View style={styles.heatmapBox}>
          <MuscleMap
            heatmapData={heatmapData.scaled}
            view="both"
            size="md"
            interactive={true}
            animated={true}
          />
          <View style={styles.heatmapLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#C6F432' }]} />
              <Text style={styles.legendText}>
                {t('reports.heatmap_overloaded')}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#8BB300' }]} />
              <Text style={styles.legendText}>
                {t('reports.heatmap_moderate')}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#4C6E00' }]} />
              <Text style={styles.legendText}>
                {t('reports.heatmap_low')}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border }]} />
              <Text style={styles.legendText}>
                {t('reports.heatmap_rested')}
              </Text>
            </View>
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.leaderboardContainer}>
          <View style={styles.leaderboardHeaderRow}>
            <Feather name="trending-up" size={14} color={Colors.electric} />
            <Text style={styles.leaderboardTitle}>
              {t('reports.leaderboard_title')}
            </Text>
          </View>

          {rankedMuscles.length > 0 ? (
            <View style={styles.leaderboardList}>
              {rankedMuscles.slice(0, 5).map((item, idx) => {
                const maxVal = rankedMuscles[0].volume || 1;
                const pct = Math.round((item.volume / maxVal) * 100);

                return (
                  <View key={item.id} style={{ marginBottom: 12 }}>
                    <View style={styles.leaderboardItemRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={styles.leaderboardRank}>#{idx + 1}</Text>
                        <Text style={styles.leaderboardName}>{item.name}</Text>
                      </View>
                      <Text style={styles.leaderboardVolume}>
                        {item.volume} {t('reports.load_units')}
                      </Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View 
                        style={[styles.progressBarFill, { width: `${pct}%` }]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.noHistoryBox}>
              <Feather name="calendar" size={24} color={Colors.border} />
              <Text style={styles.noHistoryText}>
                {t('reports.no_history')}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Activity Log */}
      <View style={{ marginBottom: 40 }}>
        <View style={styles.activityTitleRow}>
          <Feather name="list" size={18} color={Colors.electric} />
          <Text style={styles.activityTitle}>
            {t('reports.activity_log_title')}
          </Text>
        </View>

        {stats.recentActivity && stats.recentActivity.length > 0 ? (
          <View style={[globalStyles.card, { padding: 0, overflow: 'hidden' }]}>
            {stats.recentActivity.map((activity, index) => {
              const activityDate = new Date(activity.date);
              const isLast = index === stats.recentActivity.length - 1;
              return (
                <View 
                  key={activity.id} 
                  style={[styles.activityItemRow, !isLast && styles.borderBottom]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityItemName}>
                      {activity.workoutName}
                    </Text>
                    <Text style={styles.activityItemDate}>
                      {activityDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                  <View style={styles.activityItemActions}>
                    <View style={styles.badgeElectricSlim}>
                      <Text style={styles.badgeTextElectricSlim}>
                        {t('reports.completed')}
                      </Text>
                    </View>
                    <Text style={styles.activityItemCount}>
                      {t('reports.movements_count', { count: activity.exercisesCount })}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <EmptyState
            title={t('reports.empty_activity_title')}
            description={t('reports.empty_activity_desc')}
          />
        )}
      </View>

      {/* Spacer */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  blurEffect: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 256,
    height: 256,
    backgroundColor: 'rgba(198, 244, 50, 0.05)',
    borderRadius: 128,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 16,
    marginBottom: 24,
    marginTop: 16,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: Colors.onSurface,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    color: Colors.mutedGray,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginTop: 4,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.mutedGray,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 8,
  },
  statsValueMain: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 2,
    color: Colors.onSurface,
  },
  statsValueUnit: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.mutedGray,
  },
  badgeElectric: {
    backgroundColor: 'rgba(198, 244, 50, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTextElectric: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.electric,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badgeOrange: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTextOrange: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.electricOrange,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  subStatsText: {
    fontSize: 10,
    color: Colors.mutedGray,
    fontWeight: '600',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 12,
    marginBottom: 16,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartTitleText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    color: Colors.onSurface,
    textTransform: 'uppercase',
  },
  chartContainer: {
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    color: Colors.mutedGray,
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  scannerHeader: {
    flexDirection: 'column',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 16,
    marginBottom: 16,
  },
  scannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  scannerTitleText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    color: Colors.onSurface,
    textTransform: 'uppercase',
  },
  scannerSubtitleText: {
    color: Colors.mutedGray,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  timeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 4,
    alignSelf: 'flex-start',
  },
  timeToggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  timeToggleBtnActive: {
    backgroundColor: Colors.electric,
  },
  timeToggleText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.mutedGray,
  },
  timeToggleTextActive: {
    color: Colors.black,
  },
  heatmapBox: {
    backgroundColor: 'rgba(13, 13, 15, 0.4)',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heatmapLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: Colors.mutedGray,
  },
  leaderboardContainer: {},
  leaderboardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
    marginBottom: 8,
  },
  leaderboardTitle: {
    fontWeight: 'bold',
    color: Colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  leaderboardList: {},
  leaderboardItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  leaderboardRank: {
    color: Colors.electric,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  leaderboardName: {
    color: Colors.onSurface,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  leaderboardVolume: {
    color: Colors.mutedGray,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressBarBg: {
    width: '100%',
    backgroundColor: Colors.surface,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressBarFill: {
    backgroundColor: Colors.electric,
    height: '100%',
    borderRadius: 3,
  },
  noHistoryBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noHistoryText: {
    fontSize: 10,
    color: Colors.mutedGray,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 8,
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
    color: Colors.onSurface,
    textTransform: 'uppercase',
  },
  activityItemRow: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activityItemName: {
    fontWeight: 'bold',
    color: Colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 14,
    marginBottom: 4,
  },
  activityItemDate: {
    fontSize: 12,
    color: Colors.mutedGray,
    fontWeight: '600',
  },
  activityItemActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  badgeElectricSlim: {
    backgroundColor: 'rgba(198, 244, 50, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(198, 244, 50, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTextElectricSlim: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.electric,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  activityItemCount: {
    fontWeight: '900',
    color: Colors.onSurface,
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
  },
});
