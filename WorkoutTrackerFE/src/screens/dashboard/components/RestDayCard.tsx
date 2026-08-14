import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { Badge } from '../../../../components/ui';
import { formatWeekdayDate, formatTime } from '../../../utils/date';
import { WorkoutSchedule } from '../../../types';

interface RestDayCardProps {
  streakDays: number;
  nextSchedule?: WorkoutSchedule;
  onPressNext: () => void;
}

/**
 * Design 10 · Ngày nghỉ phục hồi — what the dashboard shows when nothing is
 * scheduled for today but the user already has routines.
 */
export const RestDayCard: React.FC<RestDayCardProps> = ({
  streakDays,
  nextSchedule,
  onPressNext,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(colors);

  const suggestions = [
    { icon: 'activity', title: t('dashboard.rest_stretch_title'), desc: t('dashboard.rest_stretch_desc') },
    { icon: 'map', title: t('dashboard.rest_walk_title'), desc: t('dashboard.rest_walk_desc') },
    { icon: 'droplet', title: t('dashboard.rest_hydrate_title'), desc: t('dashboard.rest_hydrate_desc') },
  ];

  return (
    <View>
      <View style={styles.hero}>
        <View style={styles.moonWrap}>
          <Icon name="moon" size={26} color={colors.electric} />
        </View>
        <Text style={styles.title}>{t('dashboard.rest_day_title')}</Text>
        <Text style={styles.desc}>{t('dashboard.rest_day_desc')}</Text>
        {streakDays > 0 && (
          <Badge
            label={t('dashboard.rest_day_streak', { count: streakDays })}
            tone="success"
            style={styles.streakBadge}
          />
        )}
      </View>

      <Text style={styles.sectionTitle}>{t('dashboard.rest_suggestions')}</Text>
      {suggestions.map((s) => (
        <View key={s.title} style={styles.suggestion}>
          <View style={styles.suggestionIcon}>
            <Icon name={s.icon as any} size={16} color={colors.electric} />
          </View>
          <View style={styles.suggestionText}>
            <Text style={styles.suggestionTitle}>{s.title}</Text>
            <Text style={styles.suggestionDesc}>{s.desc}</Text>
          </View>
        </View>
      ))}

      {!!nextSchedule && (
        <TouchableOpacity style={styles.nextRow} onPress={onPressNext}>
          <View style={styles.suggestionText}>
            <Text style={styles.nextLabel}>{t('dashboard.next_session')}</Text>
            <Text style={styles.nextValue}>
              {nextSchedule.workoutName || t('notifications.workout')} ·{' '}
              {formatWeekdayDate(nextSchedule.scheduledDate)}{' '}
              {formatTime(nextSchedule.scheduledDate)}
            </Text>
          </View>
          <Icon name="chevron-right" size={18} color={colors.mutedGray} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    hero: {
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 22,
      marginBottom: 24,
    },
    moonWrap: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.electricBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '900',
      color: colors.onSurface,
      textAlign: 'center',
      marginBottom: 10,
    },
    desc: {
      fontSize: 13,
      color: colors.mutedGray,
      textAlign: 'center',
      lineHeight: 20,
    },
    streakBadge: { marginTop: 16 },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      color: colors.mutedGray,
      marginBottom: 12,
    },
    suggestion: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    suggestionIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    suggestionText: { flex: 1 },
    suggestionTitle: { fontSize: 13, fontWeight: '800', color: colors.onSurface },
    suggestionDesc: { fontSize: 11, color: colors.mutedGray, marginTop: 3 },
    nextRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      marginTop: 10,
    },
    nextLabel: {
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.mutedGray,
    },
    nextValue: { fontSize: 13, fontWeight: '800', color: colors.onSurface, marginTop: 4 },
  });
