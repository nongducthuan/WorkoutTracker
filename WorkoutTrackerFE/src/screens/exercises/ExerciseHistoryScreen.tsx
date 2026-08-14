import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { useSettings } from '../../context/SettingsContext';
import { useExercise, useExerciseHistory } from '../../hooks';
import { DashboardSkeleton } from '../../../components/LoadingSkeleton';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { StatCard, SectionLabel, Badge } from '../../../components/ui';
import { formatShortDate } from '../../utils/date';
import { formatWeight, toDisplayWeight } from '../../utils/format';

type HistoryRoute = RouteProp<RootStackParamList, 'ExerciseHistory'>;

/** Design 04g · Lịch sử động tác. */
export default function ExerciseHistoryScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const route = useRoute<HistoryRoute>();
  const { settings } = useSettings();
  const { exerciseId } = route.params;

  const { exercise } = useExercise(exerciseId);
  const { points, sessions, currentPr, gain, totalSessions, isEstimated, isLoading } =
    useExerciseHistory(exerciseId);

  const styles = makeStyles(colors);

  if (isLoading) return <DashboardSkeleton />;

  const maxWeight = Math.max(1, ...points.map((p) => p.weight));

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title={exercise?.name || ''} subtitle={t('exercise_history.title')} />

        <View style={styles.statsRow}>
          <StatCard
            label={t('exercise_history.current_pr')}
            value={Math.round(toDisplayWeight(currentPr, settings.weightUnit) * 10) / 10}
            unit={settings.weightUnit}
            highlight
          />
          <StatCard
            label={t('exercise_history.gain_8w')}
            value={`${gain >= 0 ? '+' : ''}${
              Math.round(toDisplayWeight(gain, settings.weightUnit) * 10) / 10
            }`}
            unit={settings.weightUnit}
          />
        </View>

        {isEstimated && (
          <Text style={styles.notice}>{t('exercise_history.estimated_notice')}</Text>
        )}

        <SectionLabel>{t('exercise_history.weekly_weight')}</SectionLabel>
        <View style={styles.chart}>
          {points.map((p, idx) => (
            <View key={idx} style={styles.barColumn}>
              <Text style={styles.barValue}>
                {p.weight > 0
                  ? Math.round(toDisplayWeight(p.weight, settings.weightUnit) * 10) / 10
                  : '—'}
              </Text>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(4, (p.weight / maxWeight) * 96),
                    backgroundColor:
                      idx === points.length - 1 ? colors.electric : colors.border,
                    // A carried-forward week is drawn hollow so a rest week is
                    // not mistaken for one where this weight was actually lifted.
                    opacity: p.isEmpty ? 0.35 : 1,
                  },
                ]}
              />
            </View>
          ))}
        </View>

        <SectionLabel style={styles.sessionsLabel}>
          {t('exercise_history.recent_sessions')}
        </SectionLabel>
        {totalSessions > 0 && (
          <Text style={styles.sessionCount}>
            {t('exercise_history.session_count', { count: totalSessions })}
          </Text>
        )}
        {sessions.length === 0 ? (
          <Text style={styles.empty}>{t('exercise_history.empty')}</Text>
        ) : (
          sessions.map((s, idx) => (
            <View key={`${s.date}-${idx}`} style={styles.sessionRow}>
              <Text style={styles.sessionDate}>{formatShortDate(s.date)}</Text>
              <View style={styles.sessionBody}>
                <Text style={styles.sessionMeta}>
                  {s.sets} × {s.reps} · {formatWeight(s.weight, settings.weightUnit)}
                </Text>
                {!!s.workoutName && (
                  <Text style={styles.sessionWorkout} numberOfLines={1}>
                    {s.workoutName}
                  </Text>
                )}
              </View>
              {s.isPr && <Badge label="PR" tone="electric" />}
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
    chart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 6,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 14,
      minHeight: 150,
    },
    barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
    barValue: { fontSize: 9, color: colors.mutedGray, fontWeight: '700' },
    bar: { width: '80%', borderRadius: 4 },
    notice: {
      fontSize: 11,
      lineHeight: 16,
      color: colors.mutedGray,
      marginBottom: 12,
    },
    sessionsLabel: { marginTop: 26 },
    sessionCount: { fontSize: 11, color: colors.mutedGray, marginBottom: 10 },
    empty: { fontSize: 13, color: colors.mutedGray },
    sessionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    sessionDate: { fontSize: 12, fontWeight: '900', color: colors.electric, width: 62 },
    sessionBody: { flex: 1, gap: 2 },
    sessionMeta: { fontSize: 13, color: colors.onSurface, fontWeight: '700' },
    sessionWorkout: { fontSize: 11, color: colors.mutedGray },
  });
