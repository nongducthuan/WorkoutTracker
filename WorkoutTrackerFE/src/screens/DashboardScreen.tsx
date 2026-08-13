import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { globalStyles } from '../theme/styles';
import { useWorkouts, useSchedules, useExercises, useReports } from '../hooks/useFitnessData';
import { DashboardSkeleton } from '../../components/LoadingSkeleton';
import { MuscleMap } from '../../components/MuscleMap';
import { RootStackParamList } from '../navigation/types';
import { authApi } from '../api/auth';
import { useTheme } from '../context/ThemeContext';

type DashboardNav = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<DashboardNav>();

  const { workouts, isLoading: wLoading } = useWorkouts();
  const { schedules, isLoading: sLoading } = useSchedules();
  const { exercises, isLoading: eLoading } = useExercises();
  const { stats, isLoading: rLoading } = useReports();

  const [currentUser, setCurrentUser] = React.useState<any>(null);

  React.useEffect(() => {
    authApi.getCurrentUser().then(setCurrentUser);
  }, []);

  const isLoading = wLoading || sLoading || eLoading || rLoading;

  const todaysSchedules = useMemo(() => {
    const todayStr = new Date().toDateString();
    return schedules.filter(s => new Date(s.scheduledDate).toDateString() === todayStr);
  }, [schedules]);

  const todaySchedule = todaysSchedules.length > 0 ? todaysSchedules[0] : null;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const getGreetingTime = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return t('dashboard.greeting_morning');
    if (hrs < 18) return t('dashboard.greeting_afternoon');
    return t('dashboard.greeting_evening');
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  });

  const styles = makeStyles(colors);

  return (
    <ScrollView style={globalStyles.screen} contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={globalStyles.row}>
          <Icon name="star" size={14} color={colors.electric} style={{ marginRight: 6 }} />
          <Text style={styles.athleteText}>{t('dashboard.athlete_console')}</Text>
        </View>
        <Text style={globalStyles.heading}>
          {getGreetingTime()},{'\n'}
          <Text style={globalStyles.textElectric}>{currentUser?.name || 'Athlete'}</Text>
        </Text>
        <Text style={[globalStyles.textMuted, { marginTop: 8, fontWeight: '600' }]}>
          {formattedDate} • {t('dashboard.time_to_push')}
        </Text>
      </View>

      {/* Hero Section */}
      <View style={{ marginBottom: 24 }}>
        {workouts.length === 0 ? (
          <View style={globalStyles.card}>
            <View style={globalStyles.tagElectric}>
              <Text style={globalStyles.tagElectricText}>{t('dashboard.lets_start')}</Text>
            </View>
            <Text style={[globalStyles.heading, { fontSize: 24, marginTop: 12, marginBottom: 8 }]}>
              {t('dashboard.first_workout_title')}
            </Text>
            <Text style={[globalStyles.bodyText, { marginBottom: 24 }]}>
              {t('dashboard.first_workout_desc')}
            </Text>
            <TouchableOpacity
              style={globalStyles.btnPrimary}
              onPress={() => (navigation.getParent() as any)?.navigate('Workouts')}
            >
              <Text style={globalStyles.btnPrimaryText}>{t('dashboard.create_first')}</Text>
              <Icon name="arrow-right" size={16} color={colors.black} />
            </TouchableOpacity>
          </View>
        ) : !todaySchedule ? (
          <View style={globalStyles.card}>
            <View style={[globalStyles.tagElectric, { backgroundColor: 'rgba(107,114,128,0.1)' }]}>
              <Text style={[globalStyles.tagElectricText, { color: colors.mutedGray }]}>{t('dashboard.reminders')}</Text>
            </View>
            <Text style={[globalStyles.heading, { fontSize: 24, marginTop: 12, marginBottom: 8 }]}>
              {t('dashboard.schedule_today_title', { count: workouts.length, label: 'Workouts' })}
            </Text>
            <Text style={[globalStyles.bodyText, { marginBottom: 24 }]}>
              {t('dashboard.schedule_today_desc')}
            </Text>
            <TouchableOpacity
              style={globalStyles.btnSecondary}
              onPress={() => (navigation.getParent() as any)?.navigate('Schedule')}
            >
              <Text style={globalStyles.btnSecondaryText}>{t('dashboard.schedule_workout')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[globalStyles.card, { borderColor: 'rgba(198,244,50,0.3)' }]}>
            <View style={[globalStyles.tagElectric, { backgroundColor: colors.electric }]}>
              <Text style={[globalStyles.tagElectricText, { color: colors.black }]}>{t('dashboard.todays_session')}</Text>
            </View>
            <Text style={[globalStyles.heading, { fontSize: 24, marginTop: 12, marginBottom: 8 }]}>
              {t('dashboard.today_label')} <Text style={globalStyles.textElectric}>{todaySchedule.workoutName}</Text>
            </Text>
            <TouchableOpacity
              style={globalStyles.btnPrimary}
              onPress={() => navigation.navigate('WorkoutDetail', { id: todaySchedule.workoutId })}
            >
              <Text style={globalStyles.btnPrimaryText}>{t('dashboard.start_workout')}</Text>
              <Icon name="play" size={16} color={colors.black} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={{ marginBottom: 24 }}>
        <Text style={globalStyles.label}>{t('dashboard.quick_action')}</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Profile')}>
            <View style={styles.actionIcon}><Icon name="user" size={20} color={colors.onSurface} /></View>
            <Text style={styles.actionText}>{t('dashboard.profile')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Notifications')}>
            <View style={styles.actionIcon}><Icon name="bell" size={20} color={colors.onSurface} /></View>
            <Text style={styles.actionText}>{t('dashboard.notifications')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Achievements')}>
            <View style={styles.actionIcon}><Icon name="award" size={20} color={colors.onSurface} /></View>
            <Text style={styles.actionText}>{t('dashboard.achievements')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Muscle Map Recovery Overview */}
      <View style={{ marginBottom: 32 }}>
        <Text style={globalStyles.label}>{t('dashboard.muscle_recovery')}</Text>
        <MuscleMap size="sm" view="both" primaryMuscles={['chest', 'quadriceps']} secondaryMuscles={['triceps', 'abs']} />
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 24,
    marginBottom: 24,
  },
  athleteText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.electric,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionText: {
    color: colors.onSurface,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});