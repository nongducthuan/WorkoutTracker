import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PrimaryButton, GhostButton } from '../../../../components/ui';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { formatWeekdayDate, formatTime, isSameDay } from '../../../utils/date';
import { WorkoutSchedule } from '../../../types';

interface NextScheduleCardProps {
  schedule?: WorkoutSchedule;
  onStart: () => void;
  onSchedule: () => void;
  canStart: boolean;
}

/** "Lịch kế tiếp · Hôm nay, 18:00" block with the start button (design 04). */
export const NextScheduleCard: React.FC<NextScheduleCardProps> = ({
  schedule,
  onStart,
  onSchedule,
  canStart,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(colors);

  const label = schedule
    ? `${
        isSameDay(schedule.scheduledDate, new Date())
          ? t('common.today')
          : formatWeekdayDate(schedule.scheduledDate)
      }, ${formatTime(schedule.scheduledDate)}`
    : t('workout_detail.no_next_schedule');

  return (
    <View style={styles.card}>
      <View style={styles.textWrap}>
        <Text style={styles.label}>{t('workout_detail.next_schedule')}</Text>
        <Text style={styles.value}>{label}</Text>
      </View>
      <GhostButton label="" icon="calendar" onPress={onSchedule} size="sm" style={styles.iconBtn} />
      <PrimaryButton
        label={t('workout_detail.start_session')}
        icon="play"
        onPress={onStart}
        size="sm"
        disabled={!canStart}
      />
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
      marginBottom: 22,
    },
    textWrap: { flex: 1 },
    label: {
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.mutedGray,
    },
    value: { fontSize: 15, fontWeight: '800', color: colors.onSurface, marginTop: 5 },
    iconBtn: { paddingHorizontal: 12 },
  });
