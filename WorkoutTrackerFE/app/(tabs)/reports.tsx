import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { useReports } from '../../src/hooks/useFitnessData';
import { DashboardSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { MuscleMap } from '../../components/MuscleMap';
import { MuscleId, getMuscleLabel } from '../../src/lib/muscleMap';
import { useTranslation } from 'react-i18next';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const { t } = useTranslation();
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
      <View className="flex-1 bg-background pt-10 px-5">
        <EmptyState
          title={t('reports.empty_activity_title')}
          description={t('reports.empty_activity_desc')}
          actionText="Go to workouts →"
          onAction={() => router.push('/(tabs)/workouts')}
          icon={<Feather name="bar-chart-2" size={32} color="var(--muted-gray)" />}
        />
      </View>
    );
  }

  const totalVolumeTons = (stats.totalVolume / 1000).toFixed(1);

  const barData = (stats.weeklyWorkouts || []).map(w => ({
    value: w.count,
    label: w.week,
    frontColor: '#C6F432',
    labelTextStyle: { color: '#6B7280', fontSize: 10, fontWeight: 'bold' }
  }));

  const lineData = (stats.weeklyWorkouts || []).map(w => ({
    value: w.volume,
    label: w.week,
    labelTextStyle: { color: '#6B7280', fontSize: 10, fontWeight: 'bold' }
  }));

  const chartWidth = screenWidth - 80; 

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20 }}>
      {/* Background blur effect simulation */}
      <View className="absolute top-0 right-0 w-64 h-64 bg-electric/5 rounded-full" style={{ opacity: 0.5 }} />

      {/* Header */}
      <View className="border-b border-border-gray pb-4 mb-6 mt-4">
        <Text className="text-3xl font-black tracking-wider text-on-surface uppercase">
          {t('reports.title')}
        </Text>
        <Text className="text-muted-gray text-xs tracking-wider uppercase font-bold mt-1">
          {t('reports.subtitle')}
        </Text>
      </View>

      {/* Stats Cards */}
      <View className="space-y-4 mb-8">
        {/* Workouts */}
        <View className="bg-card border border-border-gray rounded-xl p-5">
          <Text className="text-xs font-bold uppercase tracking-wider text-muted-gray">
            {t('reports.workouts_logged')}
          </Text>
          <View className="flex-row justify-between items-baseline mt-2">
            <Text className="text-5xl font-black tracking-widest text-on-surface">
              {stats.totalWorkouts}
            </Text>
            <View className="bg-electric/10 px-2 py-0.5 rounded">
              <Text className="text-xs font-bold text-electric uppercase tracking-wider">
                {t('reports.steady')}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1.5 mt-3">
            <Feather name="calendar" size={12} color="var(--muted-gray)" />
            <Text className="text-[10px] text-muted-gray font-semibold">
              {t('reports.past_sessions')}
            </Text>
          </View>
        </View>

        {/* Volume */}
        <View className="bg-card border border-border-gray rounded-xl p-5">
          <Text className="text-xs font-bold uppercase tracking-wider text-muted-gray">
            {t('reports.tonnage_lifted')}
          </Text>
          <View className="flex-row justify-between items-baseline mt-2">
            <Text className="text-5xl font-black tracking-widest text-electric">
              {totalVolumeTons} <Text className="text-lg font-bold text-muted-gray">{t('reports.tons')}</Text>
            </Text>
            <View className="bg-electric-orange/10 px-2 py-0.5 rounded">
              <Text className="text-[10px] font-bold text-electric-orange uppercase tracking-wider">
                {t('reports.high_load')}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1.5 mt-3">
            <Feather name="trending-up" size={12} color="var(--muted-gray)" />
            <Text className="text-[10px] text-muted-gray font-semibold">
              {t('reports.tonnage_formula')}
            </Text>
          </View>
        </View>

        {/* Streak */}
        <View className="bg-card border border-border-gray rounded-xl p-5">
          <Text className="text-xs font-bold uppercase tracking-wider text-muted-gray">
            {t('reports.split_consistency')}
          </Text>
          <View className="flex-row justify-between items-baseline mt-2">
            <Text className="text-5xl font-black tracking-widest text-on-surface">
              {stats.streakDays} <Text className="text-lg font-bold text-muted-gray">{t('reports.days')}</Text>
            </Text>
            <View className="bg-electric/10 px-2 py-0.5 rounded">
              <Text className="text-xs font-bold text-electric uppercase tracking-wider">
                {t('reports.active')}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1.5 mt-3">
            <Feather name="activity" size={12} color="var(--electric-orange)" />
            <Text className="text-[10px] text-muted-gray font-semibold">
              {t('reports.consecutive_freq')}
            </Text>
          </View>
        </View>
      </View>

      {/* Charts */}
      <View className="space-y-6 mb-8">
        {/* Session frequency Chart */}
        <View className="bg-card border border-border-gray rounded-xl p-5">
          <View className="flex-row items-center justify-between border-b border-border-gray pb-3 mb-4">
            <View className="flex-row items-center gap-2">
              <Feather name="bar-chart-2" size={16} color="var(--electric)" />
              <Text className="text-sm font-black tracking-wider text-on-surface uppercase">
                {t('reports.session_frequency')}
              </Text>
            </View>
            <View className="bg-electric/15 px-2 py-0.5 rounded">
              <Text className="text-[10px] text-electric font-black uppercase tracking-wider">
                {t('reports.workouts_per_week')}
              </Text>
            </View>
          </View>
          <View className="h-48 items-center justify-center">
             {barData.length > 0 ? (
                <BarChart
                  data={barData}
                  barWidth={24}
                  noOfSections={4}
                  barBorderRadius={4}
                  frontColor="#C6F432"
                  yAxisThickness={0}
                  xAxisThickness={0}
                  hideRules={true}
                  yAxisTextStyle={{ color: '#6B7280', fontSize: 10, fontWeight: 'bold' }}
                  isAnimated
                  width={chartWidth}
                  height={150}
                  disableScroll={true}
                />
             ) : (
                <Text className="text-muted-gray text-xs uppercase font-bold tracking-wider">No Data</Text>
             )}
          </View>
        </View>

        {/* Volume progression Chart */}
        <View className="bg-card border border-border-gray rounded-xl p-5">
          <View className="flex-row items-center justify-between border-b border-border-gray pb-3 mb-4">
            <View className="flex-row items-center gap-2">
              <Feather name="activity" size={16} color="var(--electric-orange)" />
              <Text className="text-sm font-black tracking-wider text-on-surface uppercase">
                {t('reports.volume_progression')}
              </Text>
            </View>
            <View className="bg-electric-orange/15 px-2 py-0.5 rounded">
              <Text className="text-[10px] text-electric-orange font-black uppercase tracking-wider">
                {t('reports.tonnage_curve')}
              </Text>
            </View>
          </View>
          <View className="h-48 items-center justify-center">
            {lineData.length > 0 ? (
              <LineChart
                data={lineData}
                areaChart
                hideDataPoints
                color="#FF6B35"
                startFillColor="#FF6B35"
                endFillColor="#FF6B35"
                startOpacity={0.2}
                endOpacity={0}
                thickness={2}
                yAxisThickness={0}
                xAxisThickness={0}
                hideRules={true}
                yAxisTextStyle={{ color: '#6B7280', fontSize: 10, fontWeight: 'bold' }}
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
              <Text className="text-muted-gray text-xs uppercase font-bold tracking-wider">No Data</Text>
            )}
          </View>
        </View>
      </View>

      {/* Heatmap & Leaderboard */}
      <View className="bg-card border border-border-gray rounded-xl p-5 mb-8">
        <View className="flex-col gap-4 border-b border-border-gray pb-4 mb-4">
          <View>
            <View className="flex-row items-center gap-2 mb-1">
              <Feather name="target" size={18} color="var(--electric)" />
              <Text className="text-lg font-black tracking-wider text-on-surface uppercase">
                {t('reports.scanner_title')}
              </Text>
            </View>
            <Text className="text-muted-gray text-xs tracking-wider uppercase font-bold">
              {t('reports.scanner_desc')}
            </Text>
          </View>

          {/* Time Range Toggle */}
          <View className="flex-row bg-background border border-border-gray rounded-lg p-1 self-start">
            <TouchableOpacity
              onPress={() => setTimeRange('weekly')}
              className={`px-4 py-2 rounded-md ${
                timeRange === 'weekly' ? 'bg-electric' : 'bg-transparent'
              }`}
            >
              <Text className={`text-[10px] font-black uppercase tracking-wider ${
                timeRange === 'weekly' ? 'text-black' : 'text-muted-gray'
              }`}>
                {t('reports.weekly_split')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTimeRange('monthly')}
              className={`px-4 py-2 rounded-md ${
                timeRange === 'monthly' ? 'bg-electric' : 'bg-transparent'
              }`}
            >
              <Text className={`text-[10px] font-black uppercase tracking-wider ${
                timeRange === 'monthly' ? 'text-black' : 'text-muted-gray'
              }`}>
                {t('reports.monthly_split')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Heatmap container */}
        <View className="bg-[#0D0D0F]/40 border border-border-gray rounded-2xl p-4 py-6 items-center justify-center mb-6">
          <MuscleMap
            heatmapData={heatmapData.scaled}
            view="both"
            size="md"
            interactive={true}
            animated={true}
          />
          <View className="flex-row flex-wrap justify-center gap-4 mt-6 pt-4 border-t border-border-gray w-full">
            <View className="flex-row items-center gap-1.5">
              <View className="w-3 h-3 rounded-sm bg-[#C6F432]" />
              <Text className="text-[9px] font-black uppercase tracking-widest text-muted-gray">
                {t('reports.heatmap_overloaded')}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-3 h-3 rounded-sm bg-[#8BB300]" />
              <Text className="text-[9px] font-black uppercase tracking-widest text-muted-gray">
                {t('reports.heatmap_moderate')}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-3 h-3 rounded-sm bg-[#4C6E00]" />
              <Text className="text-[9px] font-black uppercase tracking-widest text-muted-gray">
                {t('reports.heatmap_low')}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-3 h-3 rounded-sm bg-card border border-border-gray" />
              <Text className="text-[9px] font-black uppercase tracking-widest text-muted-gray">
                {t('reports.heatmap_rested')}
              </Text>
            </View>
          </View>
        </View>

        {/* Leaderboard */}
        <View className="space-y-4">
          <View className="flex-row items-center gap-2 border-b border-border-gray pb-2 mb-2">
            <Feather name="trending-up" size={14} color="var(--electric)" />
            <Text className="font-bold text-on-surface uppercase tracking-wider text-xs">
              {t('reports.leaderboard_title')}
            </Text>
          </View>

          {rankedMuscles.length > 0 ? (
            <View className="space-y-4">
              {rankedMuscles.slice(0, 5).map((item, idx) => {
                const maxVal = rankedMuscles[0].volume || 1;
                const pct = Math.round((item.volume / maxVal) * 100);

                return (
                  <View key={item.id} className="mb-3">
                    <View className="flex-row justify-between items-center mb-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-electric text-[9px] font-black uppercase tracking-wider">#{idx + 1}</Text>
                        <Text className="text-on-surface text-[10px] font-black uppercase tracking-wider">{item.name}</Text>
                      </View>
                      <Text className="text-muted-gray text-[10px] font-bold uppercase tracking-wider">
                        {item.volume} {t('reports.load_units')}
                      </Text>
                    </View>
                    <View className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-border-gray">
                      <View 
                        className="bg-electric h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="py-10 items-center justify-center">
              <Feather name="calendar" size={24} color="var(--border-gray)" />
              <Text className="text-[10px] text-muted-gray uppercase font-bold tracking-wider mt-2">
                {t('reports.no_history')}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Activity Log */}
      <View className="mb-10">
        <View className="flex-row items-center gap-2 mb-4">
          <Feather name="list" size={18} color="var(--electric)" />
          <Text className="text-xl font-black tracking-wider text-on-surface uppercase">
            {t('reports.activity_log_title')}
          </Text>
        </View>

        {stats.recentActivity && stats.recentActivity.length > 0 ? (
          <View className="bg-card border border-border-gray rounded-xl overflow-hidden">
            {stats.recentActivity.map((activity, index) => {
              const activityDate = new Date(activity.date);
              const isLast = index === stats.recentActivity.length - 1;
              return (
                <View 
                  key={activity.id} 
                  className={`p-4 flex-row justify-between items-center ${!isLast ? 'border-b border-border-gray' : ''}`}
                >
                  <View className="flex-1">
                    <Text className="font-bold text-on-surface uppercase tracking-wider text-sm mb-1">
                      {activity.workoutName}
                    </Text>
                    <Text className="text-xs text-muted-gray font-semibold">
                      {activityDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                  <View className="items-end gap-2">
                    <View className="bg-electric/10 border border-electric/10 px-2 py-0.5 rounded">
                      <Text className="text-[9px] font-black uppercase tracking-wider text-electric">
                        {t('reports.completed')}
                      </Text>
                    </View>
                    <Text className="font-black text-on-surface bg-surface px-2 py-0.5 rounded text-xs">
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
      <View className="h-10" />
    </ScrollView>
  );
}
