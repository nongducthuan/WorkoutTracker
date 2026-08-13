import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReports } from '../hooks/useFitnessData';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';

type AchievementsNav = NativeStackNavigationProp<RootStackParamList>;

export default function AchievementsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<AchievementsNav>();
  const { stats, isLoading } = useReports();

  const totalWorkouts = stats?.totalWorkouts ?? 0;
  const streakDays = stats?.streakDays ?? 0;
  const totalVolume = stats?.totalVolume ?? 0;

  const badges = [
    {
      icon: 'zap',
      label: t('achievements.streak_7'),
      earned: streakDays >= 7,
      progress: `${Math.min(streakDays, 7)}/7`,
    },
    {
      icon: 'award',
      label: t('achievements.workouts_10'),
      earned: totalWorkouts >= 10,
      progress: `${Math.min(totalWorkouts, 10)}/10`,
    },
    {
      icon: 'trending-up',
      label: t('achievements.workouts_50'),
      earned: totalWorkouts >= 50,
      progress: `${Math.min(totalWorkouts, 50)}/50`,
    },
    {
      icon: 'star',
      label: t('achievements.streak_30'),
      earned: streakDays >= 30,
      progress: `${Math.min(streakDays, 30)}/30`,
    },
  ];

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Feather name="chevron-left" size={20} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('achievements.title')}</Text>
          <View style={styles.iconButton} />
        </View>

        {/* Summary stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{isLoading ? '—' : totalWorkouts}</Text>
            <Text style={styles.statLabel}>{t('achievements.total_workouts')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{isLoading ? '—' : streakDays}</Text>
            <Text style={styles.statLabel}>{t('achievements.streak_days')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{isLoading ? '—' : totalVolume}</Text>
            <Text style={styles.statLabel}>{t('achievements.total_volume')}</Text>
          </View>
        </View>

        {/* Badges grid */}
        <Text style={styles.sectionLabel}>{t('achievements.badges')}</Text>
        <View style={styles.badgeGrid}>
          {badges.map((badge) => (
            <View
              key={badge.label}
              style={[styles.badgeCard, badge.earned ? styles.badgeCardEarned : styles.badgeCardLocked]}
            >
              <View style={[styles.badgeIconWrap, badge.earned && styles.badgeIconWrapEarned]}>
                <Feather
                  name={badge.icon as any}
                  size={24}
                  color={badge.earned ? colors.black : colors.mutedGray}
                />
              </View>
              <Text style={[styles.badgeLabel, !badge.earned && styles.badgeLabelLocked]}>
                {badge.label}
              </Text>
              <Text style={styles.badgeProgress}>{badge.progress}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: colors.onSurface,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.electric,
  },
  statLabel: {
    fontSize: 10,
    color: colors.mutedGray,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.mutedGray,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '47%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  badgeCardEarned: {
    backgroundColor: colors.card,
    borderColor: 'rgba(198,244,50,0.4)',
  },
  badgeCardLocked: {
    backgroundColor: colors.card,
    borderColor: colors.borderGray,
    opacity: 0.6,
  },
  badgeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  badgeIconWrapEarned: {
    backgroundColor: colors.electric,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.onSurface,
    textAlign: 'center',
  },
  badgeLabelLocked: {
    color: colors.mutedGray,
  },
  badgeProgress: {
    fontSize: 10,
    color: colors.mutedGray,
    marginTop: 4,
  },
});