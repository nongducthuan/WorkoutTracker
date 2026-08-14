import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import { useSettings } from '../context/SettingsContext';
import { useReports, usePersonalRecords } from '../hooks';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StatCard, SectionLabel, ProgressBar, Badge } from '../../components/ui';
import { DashboardSkeleton } from '../../components/LoadingSkeleton';
import { formatWeight, toTons } from '../utils/format';

interface BadgeSpec {
  key: string;
  icon: string;
  label: string;
  current: number;
  target: number;
  unit: string;
}

/** Design 07d · Thành tích. */
export default function AchievementsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { stats, isLoading } = useReports();
  const { records } = usePersonalRecords();

  const totalWorkouts = stats?.totalWorkouts ?? 0;
  const streakDays = stats?.streakDays ?? 0;
  const totalVolume = stats?.totalVolume ?? 0;
  const heaviest = records[0];

  const badges = useMemo<BadgeSpec[]>(
    () => [
      {
        key: 'streak7',
        icon: 'zap',
        label: t('achievements.streak_7'),
        current: streakDays,
        target: 7,
        unit: t('achievements.days_unit'),
      },
      {
        key: 'workouts50',
        icon: 'award',
        label: t('achievements.workouts_50'),
        current: totalWorkouts,
        target: 50,
        unit: t('achievements.sessions_unit'),
      },
      {
        key: 'firstPr',
        icon: 'star',
        label: t('achievements.badge_first_pr'),
        current: records.length > 0 ? 1 : 0,
        target: 1,
        unit: '',
      },
      {
        key: 'streak30',
        icon: 'trending-up',
        label: t('achievements.streak_30'),
        current: streakDays,
        target: 30,
        unit: t('achievements.days_unit'),
      },
      {
        key: 'workouts100',
        icon: 'target',
        label: t('achievements.workouts_50').replace('50', '100'),
        current: totalWorkouts,
        target: 100,
        unit: t('achievements.sessions_unit'),
      },
      {
        key: 'tons100',
        icon: 'bar-chart-2',
        label: t('achievements.badge_100_tons'),
        current: toTons(totalVolume),
        target: 100,
        unit: t('achievements.tons_unit'),
      },
    ],
    [t, streakDays, totalWorkouts, totalVolume, records.length]
  );

  const styles = makeStyles(colors);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title={t('achievements.title')} />

        <View style={styles.statsRow}>
          <StatCard
            label={t('achievements.heaviest_pr')}
            value={heaviest ? formatWeight(heaviest.weight, settings.weightUnit) : '—'}
            caption={heaviest?.exerciseName}
            highlight
          />
          <StatCard
            label={t('achievements.longest_streak')}
            value={streakDays}
            unit={t('achievements.days_unit')}
          />
        </View>

        <SectionLabel>{t('achievements.badges')}</SectionLabel>
        <View style={styles.badgeGrid}>
          {badges.map((badge) => {
            const earned = badge.current >= badge.target;
            return (
              <View key={badge.key} style={[styles.badgeCard, earned && styles.badgeCardEarned]}>
                <View style={[styles.badgeIcon, earned && styles.badgeIconEarned]}>
                  <Icon
                    name={badge.icon as any}
                    size={18}
                    color={earned ? colors.black : colors.mutedGray}
                  />
                </View>
                <Text style={styles.badgeLabel} numberOfLines={2}>
                  {badge.label}
                </Text>
                {earned ? (
                  <Badge label={t('achievements.earned')} tone="success" />
                ) : (
                  <>
                    <ProgressBar
                      value={badge.current / badge.target}
                      height={4}
                      style={styles.badgeBar}
                    />
                    <Text style={styles.badgeProgress}>
                      {Math.round(badge.current)}/{badge.target} {badge.unit}
                    </Text>
                  </>
                )}
              </View>
            );
          })}
        </View>

        <SectionLabel style={styles.recordsLabel}>
          {t('achievements.personal_records')}
        </SectionLabel>
        {records.length === 0 ? (
          <Text style={styles.empty}>{t('achievements.no_records')}</Text>
        ) : (
          records.slice(0, 8).map((record) => (
            <View key={record.exerciseId} style={styles.recordRow}>
              <Text style={styles.recordName} numberOfLines={1}>
                {record.exerciseName}
              </Text>
              <Text style={styles.recordValue}>
                {formatWeight(record.weight, settings.weightUnit)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    badgeCard: {
      width: '47%',
      flexGrow: 1,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 14,
      gap: 8,
    },
    badgeCardEarned: { borderColor: colors.electric },
    badgeIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeIconEarned: { backgroundColor: colors.electric },
    badgeLabel: { fontSize: 12, fontWeight: '800', color: colors.onSurface },
    badgeBar: { marginTop: 2 },
    badgeProgress: { fontSize: 10, color: colors.mutedGray },
    recordsLabel: { marginTop: 28 },
    empty: { fontSize: 13, color: colors.mutedGray },
    recordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 13,
      marginBottom: 10,
    },
    recordName: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.onSurface },
    recordValue: { fontSize: 14, fontWeight: '900', color: colors.electric },
  });
