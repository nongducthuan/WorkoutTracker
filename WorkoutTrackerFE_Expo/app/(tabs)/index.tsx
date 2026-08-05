import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { 
  useSchedules, 
  useReports, 
  useWorkouts, 
  useWorkoutExercises, 
  useExercises 
} from '../../src/hooks/useFitnessData';
import { authApi } from '../../src/api/auth';
import { DashboardSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { MuscleMap } from '../../components/MuscleMap';
import { MuscleId, getMuscleLabel } from '../../src/lib/muscleMap';
import { useTranslation } from 'react-i18next';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    authApi.getCurrentUser().then(setCurrentUser);
  }, []);

  const { schedules = [], isLoading: isSchedulesLoading } = useSchedules();
  const { stats, isLoading: isReportsLoading } = useReports();
  const { workouts = [], isLoading: isWorkoutsLoading } = useWorkouts();
  const { exercises: globalExercises = [] } = useExercises();

  const [hideTip, setHideTip] = useState<boolean>(false);

  const todayStr = new Date().toDateString();
  const todaysSchedules = useMemo(() => {
    return schedules.filter(s => {
      const d = new Date(s.scheduledDate);
      return d.toDateString() === todayStr;
    });
  }, [schedules, todayStr]);

  const todaySchedule = todaysSchedules[0];
  const todayWorkoutId = todaySchedule?.workoutId || '';
  
  const { workoutExercises = [] } = useWorkoutExercises(todayWorkoutId);

  const isLoading = isSchedulesLoading || isReportsLoading || isWorkoutsLoading;

  const todaysTargets = useMemo(() => {
    const primarySet = new Set<MuscleId>();
    const secondarySet = new Set<MuscleId>();

    todaysSchedules.forEach((sched) => {
      const name = (sched.workoutName || '').toLowerCase();
      const addScore = (muscle: MuscleId, type: 'primary' | 'secondary') => {
        if (type === 'primary') primarySet.add(muscle);
        else secondarySet.add(muscle);
      };

      if (name.includes('chest') || name.includes('push')) {
        addScore('chest', 'primary');
        addScore('front-deltoid', 'secondary');
        addScore('triceps', 'secondary');
      } else if (name.includes('back') || name.includes('pull')) {
        addScore('lats', 'primary');
        addScore('biceps', 'secondary');
        addScore('trapezius-back', 'secondary');
      } else if (name.includes('leg') || name.includes('squat') || name.includes('lower')) {
        addScore('quadriceps', 'primary');
        addScore('glutes', 'primary');
        addScore('hamstrings', 'secondary');
        addScore('calves', 'secondary');
      } else if (name.includes('shoulder') || name.includes('press')) {
        addScore('front-deltoid', 'primary');
        addScore('rear-deltoid', 'secondary');
      } else if (name.includes('core') || name.includes('abs')) {
        addScore('abs', 'primary');
        addScore('obliques', 'secondary');
      } else {
        addScore('chest', 'primary');
        addScore('lats', 'primary');
      }
    });

    return {
      primary: Array.from(primarySet),
      secondary: Array.from(secondarySet),
    };
  }, [todaysSchedules]);

  const activeTip = useMemo(() => {
    const tips = [
      "💡 Tip: Rest 60–90 seconds between sets for best results",
      "💡 Tip: Log your weight each workout to track progress",
      "💡 Tip: Aim for 3 workouts per week as a beginner"
    ];
    const index = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 3)) % tips.length;
    return tips[index];
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const workoutsThisWeek = stats?.workoutsThisWeek || stats?.recentActivity?.filter(act => {
    const diff = Date.now() - new Date(act.date).getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  }).length || 0;
  
  const streakDays = stats?.streakDays || 0;
  const globalExercisesCount = globalExercises?.length || 18;

  const getGreetingTime = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return t('dashboard.greeting_morning');
    if (hrs < 18) return t('dashboard.greeting_afternoon');
    return t('dashboard.greeting_evening');
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View className="mb-6 border-b border-border-gray pb-4">
        <View className="flex-row items-center gap-1.5 mb-2">
          <Feather name="star" size={14} color="var(--electric)" />
          <Text className="text-xs font-bold uppercase tracking-wider text-electric">
            {t('dashboard.athlete_console')}
          </Text>
        </View>
        <Text className="text-3xl font-black text-on-surface uppercase tracking-tight">
          {getGreetingTime()},{'\n'}
          <Text className="text-electric">{currentUser?.name || 'Athlete'}</Text>
        </Text>
        <Text className="text-muted-gray text-sm font-semibold tracking-wide mt-2">
          {formattedDate} • {t('dashboard.time_to_push')}
        </Text>
      </View>

      {/* Hero Section */}
      <View className="mb-6">
        {workouts.length === 0 ? (
          <View className="bg-card border border-border-gray rounded-xl p-6 shadow-lg">
            <View className="bg-electric/15 self-start px-2 py-1 rounded mb-3">
              <Text className="text-[10px] font-black text-electric uppercase tracking-widest">
                {t('dashboard.lets_start')}
              </Text>
            </View>
            <Text className="text-2xl font-black text-on-surface uppercase tracking-wider mb-2">
              {t('dashboard.first_workout_title')}
            </Text>
            <Text className="text-muted-gray text-xs font-semibold mb-6">
              {t('dashboard.first_workout_desc')}
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/workouts')}
              className="bg-electric flex-row items-center justify-center py-3 rounded-lg gap-2"
            >
              <Text className="text-black font-black uppercase text-sm">{t('dashboard.create_first')}</Text>
              <Feather name="arrow-right" size={16} color="black" />
            </TouchableOpacity>
          </View>
        ) : todaysSchedules.length === 0 ? (
          <View className="bg-card border border-border-gray rounded-xl p-6 shadow-lg">
            <View className="bg-muted-gray/10 self-start px-2 py-1 rounded mb-3">
              <Text className="text-[10px] font-black text-muted-gray uppercase tracking-widest">
                {t('dashboard.reminders')}
              </Text>
            </View>
            <Text className="text-2xl font-black text-on-surface uppercase tracking-wider mb-2">
              {t('dashboard.schedule_today_title', { count: workouts.length, label: workouts.length === 1 ? t('dashboard.workout_label_singular') : t('dashboard.workout_label_plural') })}
            </Text>
            <Text className="text-muted-gray text-xs font-semibold mb-6">
              {t('dashboard.schedule_today_desc')}
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/schedule')}
              className="bg-surface border border-border-gray flex-row items-center justify-center py-3 rounded-lg gap-2"
            >
              <Text className="text-on-surface font-black uppercase text-sm">{t('dashboard.schedule_workout')}</Text>
              <Feather name="calendar" size={16} color="var(--on-surface)" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="bg-card border border-electric/30 rounded-xl p-6 shadow-lg relative overflow-hidden">
            <View className="bg-electric self-start px-2 py-1 rounded mb-3">
              <Text className="text-[10px] font-black text-black uppercase tracking-widest">
                {t('dashboard.todays_session')}
              </Text>
            </View>
            <Text className="text-2xl font-black text-on-surface uppercase tracking-wider mb-1">
              {t('dashboard.today_label')} <Text className="text-electric">{todaySchedule.workoutName}</Text>
            </Text>
            <Text className="text-muted-gray text-xs font-semibold mb-4">
              {t('dashboard.ready_sweat')}
            </Text>

            {workoutExercises && workoutExercises.length > 0 ? (
              <View className="mb-6">
                <Text className="text-[10px] font-black text-muted-gray uppercase tracking-widest mb-2">
                  {t('dashboard.exercises_planned')}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {workoutExercises.map((we: any) => (
                    <View key={we.id} className="bg-surface border border-border-gray px-2.5 py-1 rounded flex-row items-center gap-1.5">
                      <View className="w-1.5 h-1.5 rounded-full bg-electric" />
                      <Text className="text-[10px] font-bold text-on-surface uppercase tracking-wide">
                        {we.exerciseName}
                      </Text>
                      <Text className="text-muted-gray text-[10px] font-semibold">
                        ({we.sets}×{we.repetitions})
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Text className="text-[10px] text-muted-gray uppercase font-bold tracking-wider mb-6">
                {t('dashboard.no_exercises_yet')}
              </Text>
            )}

            <TouchableOpacity 
              onPress={() => router.push(`/workouts/${todaySchedule.workoutId}`)}
              className="bg-electric flex-row items-center justify-center py-3.5 rounded-lg gap-2"
              style={{
                shadowColor: 'var(--electric)',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <Feather name="play" size={16} color="black" />
              <Text className="text-black font-black uppercase tracking-wider text-sm">{t('dashboard.start_workout')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Stats Grid */}
      <View className="flex-row flex-wrap justify-between mb-6">
        {/* Workouts this week */}
        <View className="w-[48%] bg-card border border-border-gray rounded-xl p-4 mb-4">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-gray mb-1">
            {t('dashboard.workouts_this_week')}
          </Text>
          <Text className="text-3xl font-black text-on-surface">
            {workoutsThisWeek} <Text className="text-xs font-bold text-muted-gray">/ 3 {t('dashboard.goal_label')}</Text>
          </Text>
          <View className="w-full bg-surface h-1.5 rounded-full mt-3 overflow-hidden">
            <View 
              className="bg-electric h-full rounded-full"
              style={{ width: `${Math.min((workoutsThisWeek / 3) * 100, 100)}%` }}
            />
          </View>
        </View>

        {/* Current Streak */}
        <View className="w-[48%] bg-card border border-border-gray rounded-xl p-4 mb-4 flex-row justify-between">
          <View>
            <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-gray mb-1">
              {t('dashboard.current_streak')}
            </Text>
            <Text className="text-3xl font-black text-on-surface">
              {streakDays} <Text className="text-xs font-bold text-muted-gray">{t('dashboard.days_label')}</Text>
            </Text>
          </View>
          <View className="w-8 h-8 rounded-lg bg-electric-orange/10 items-center justify-center">
            <Feather name="zap" size={16} color="var(--electric-orange)" />
          </View>
        </View>
      </View>

      {/* Today's Workouts List */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-black text-on-surface uppercase tracking-wider">
            {t('dashboard.todays_workouts')}
          </Text>
          <View className="bg-electric/15 px-2 py-1 rounded">
            <Text className="text-electric text-[10px] font-black uppercase tracking-wider">
              {t('dashboard.scheduled_count', { count: todaysSchedules.length })}
            </Text>
          </View>
        </View>

        {todaysSchedules.length > 0 ? (
          <View className="space-y-3">
            {todaysSchedules.map((schedule) => {
              const corrWorkout = workouts.find(w => w.id === schedule.workoutId);
              return (
                <TouchableOpacity
                  key={schedule.id}
                  onPress={() => router.push(`/workouts/${schedule.workoutId}`)}
                  className="bg-card border border-border-gray rounded-xl p-4 flex-row items-center justify-between"
                >
                  <View className="flex-1 mr-4">
                    <Text className="text-base font-bold tracking-wider text-on-surface mb-1">
                      {schedule.workoutName}
                    </Text>
                    <Text className="text-xs text-muted-gray font-semibold mb-2" numberOfLines={1}>
                      {corrWorkout?.description || t('dashboard.no_description')}
                    </Text>
                    <View className="bg-electric/10 self-start px-2 py-0.5 rounded">
                      <Text className="text-[10px] text-electric font-bold uppercase tracking-wider">
                        {new Date(schedule.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                  <View className="w-8 h-8 rounded-lg bg-surface border border-border-gray items-center justify-center">
                    <Feather name="chevron-right" size={16} color="var(--muted-gray)" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <EmptyState
            title={t('dashboard.no_workouts_today')}
            description={t('dashboard.no_workouts_today_desc')}
            actionText={t('dashboard.view_library')}
            onAction={() => router.push('/(tabs)/workouts')}
            icon={<Feather name="calendar" size={32} color="var(--muted-gray)" />}
          />
        )}
      </View>

      {/* Target Splits */}
      <View className="bg-card border border-border-gray rounded-xl p-5 mb-8">
        <View className="border-b border-border-gray pb-3 mb-4 flex-row items-center gap-2">
          {todaysSchedules.length > 0 ? (
            <>
              <Feather name="activity" size={14} color="var(--electric)" />
              <Text className="font-bold text-on-surface uppercase tracking-wider text-xs">
                {t('dashboard.todays_split')}
              </Text>
            </>
          ) : (
            <>
              <Feather name="heart" size={14} color="var(--electric-orange)" />
              <Text className="font-bold text-on-surface uppercase tracking-wider text-xs">
                {t('dashboard.recovery_split')}
              </Text>
            </>
          )}
        </View>

        <View className="bg-surface border border-border-gray rounded-xl p-2 items-center justify-center mb-4">
          <MuscleMap
            primaryMuscles={todaysTargets.primary}
            secondaryMuscles={todaysTargets.secondary}
            view="front"
            size="sm"
            interactive={false}
            animated={true}
            isRecovery={todaysSchedules.length === 0}
          />
        </View>

        {todaysSchedules.length > 0 ? (
          <View>
            <Text className="text-[10px] font-black text-muted-gray uppercase tracking-widest mb-2">
              {t('dashboard.todays_target_splits')}
            </Text>
            <View className="flex-row flex-wrap gap-1.5">
              {todaysTargets.primary.map((m: any) => (
                <View key={m} className="bg-electric/15 border border-electric/15 px-2 py-0.5 rounded">
                  <Text className="text-[9px] font-extrabold uppercase tracking-wide text-electric">
                    {getMuscleLabel(m)}
                  </Text>
                </View>
              ))}
              {todaysTargets.secondary.map((m: any) => (
                <View key={m} className="bg-electric-orange/15 border border-electric-orange/15 px-2 py-0.5 rounded">
                  <Text className="text-[9px] font-extrabold uppercase tracking-wide text-electric-orange">
                    {getMuscleLabel(m)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View className="bg-electric-orange/10 border border-electric-orange/20 rounded-lg p-4 items-center">
            <Text className="text-[10px] font-black text-electric-orange uppercase tracking-wider mb-1">
              {t('dashboard.recovery_day')}
            </Text>
            <Text className="text-[10px] font-bold text-muted-gray uppercase text-center mt-1">
              {t('dashboard.recovery_tip')}
            </Text>
          </View>
        )}
      </View>

      {/* Spacer for bottom tab */}
      <View className="h-10" />
    </ScrollView>
  );
}
