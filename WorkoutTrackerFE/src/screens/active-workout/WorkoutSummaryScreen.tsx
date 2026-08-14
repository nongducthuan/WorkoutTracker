import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
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
  useComments,
  useWorkoutSchedules,
  useActiveWorkout,
  useLogSession,
} from '../../hooks';
import { StatCard, PrimaryButton, GhostButton, Badge } from '../../../components/ui';
import { formatFullDate } from '../../utils/date';
import { formatWeight, toTons } from '../../utils/format';

type SummaryRoute = RouteProp<RootStackParamList, 'WorkoutSummary'>;
type SummaryNav = NativeStackNavigationProp<RootStackParamList>;

/** Design 04c · Tổng kết buổi tập. */
export default function WorkoutSummaryScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const route = useRoute<SummaryRoute>();
  const navigation = useNavigation<SummaryNav>();
  const { settings } = useSettings();

  const {
    workoutId,
    durationSeconds,
    totalVolume,
    prCount,
    exercises,
    scheduleId,
    startedAt,
    sets,
  } = route.params;

  const { workout } = useWorkout(workoutId);
  const { addComment } = useComments(workoutId);
  const { completeSchedule, isCompleting } = useWorkoutSchedules(workoutId);
  const { logSession, isLogging } = useLogSession();
  const session = useActiveWorkout(workoutId, []);

  const [note, setNote] = useState('');
  const [isNoteOpen, setNoteOpen] = useState(false);

  const prExercises = exercises.filter((e) => e.isPr);

  const handleFinish = async () => {
    if (note.trim()) await addComment(note.trim());

    try {
      // The session is the record of what was performed; the server marks the
      // linked schedule complete as part of the same write.
      await logSession({
        workoutId,
        scheduleId,
        startedAt,
        durationSec: Math.round(durationSeconds),
        note: note.trim() || undefined,
        sets: sets ?? [],
      });
    } catch {
      // Logging failed (offline, say). Fall back to the older flag so the
      // session still counts towards streaks rather than vanishing.
      if (scheduleId) await completeSchedule(scheduleId);
    }

    await session.reset();
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.checkCircle}>
            <Icon name="check" size={32} color={colors.black} />
          </View>
          <Text style={styles.title}>{t('summary.title')}</Text>
          <Text style={styles.subtitle}>
            {workout?.name} · {formatFullDate(new Date())}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            label={t('summary.duration')}
            value={Math.max(1, Math.round(durationSeconds / 60))}
            unit={t('common.minutes_short')}
          />
          <StatCard
            label={t('summary.volume')}
            value={toTons(totalVolume)}
            unit={t('achievements.tons_unit')}
            highlight
          />
          <StatCard label={t('summary.new_prs')} value={prCount} />
        </View>

        {prCount > 0 && (
          <View style={styles.prCard}>
            <View style={styles.prIcon}>
              <Icon name="award" size={18} color={colors.electric} />
            </View>
            <View style={styles.prText}>
              <Text style={styles.prTitle}>{t('summary.pr_title')}</Text>
              <Text style={styles.prBody}>
                {prExercises
                  .map((e) => `${e.name} ${formatWeight(e.weight, settings.weightUnit)}`)
                  .join(' · ')}
              </Text>
            </View>
          </View>
        )}

        {exercises.map((ex) => (
          <View key={ex.id} style={styles.exerciseRow}>
            <View style={styles.exerciseText}>
              <Text style={styles.exerciseName}>{ex.name}</Text>
              <Text style={styles.exerciseMeta}>
                {t('summary.sets_count', { count: ex.sets })} ·{' '}
                {formatWeight(ex.weight, settings.weightUnit)}
              </Text>
            </View>
            {ex.isPr && <Badge label="PR" tone="electric" />}
          </View>
        ))}

        {isNoteOpen ? (
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={t('summary.note_placeholder')}
            placeholderTextColor={colors.mutedGray}
            style={styles.noteInput}
            multiline
            autoFocus
          />
        ) : (
          <GhostButton
            label={t('summary.add_note')}
            icon="edit-3"
            onPress={() => setNoteOpen(true)}
            style={styles.noteBtn}
          />
        )}

        <PrimaryButton
          label={t('summary.save_finish')}
          onPress={handleFinish}
          loading={isCompleting || isLogging}
          style={styles.finishBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    hero: { alignItems: 'center', paddingVertical: 26 },
    checkCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.electric,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
    },
    title: { fontSize: 26, fontWeight: '900', color: colors.onSurface },
    subtitle: { fontSize: 12, color: colors.mutedGray, marginTop: 8 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    prCard: {
      flexDirection: 'row',
      gap: 12,
      backgroundColor: colors.electricBg,
      borderWidth: 1,
      borderColor: colors.electric,
      borderRadius: 14,
      padding: 16,
      marginBottom: 20,
    },
    prIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    prText: { flex: 1 },
    prTitle: {
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.onSurface,
    },
    prBody: { fontSize: 12, color: colors.mutedGray, marginTop: 6, lineHeight: 18 },
    exerciseRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    exerciseText: { flex: 1 },
    exerciseName: { fontSize: 14, fontWeight: '800', color: colors.onSurface },
    exerciseMeta: { fontSize: 11, color: colors.mutedGray, marginTop: 3 },
    noteInput: {
      minHeight: 90,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      fontSize: 14,
      color: colors.onSurface,
      textAlignVertical: 'top',
      marginTop: 12,
    },
    noteBtn: { marginTop: 12 },
    finishBtn: { marginTop: 16 },
  });
