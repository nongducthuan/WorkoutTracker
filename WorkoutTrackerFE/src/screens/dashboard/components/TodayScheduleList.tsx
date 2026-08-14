import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { formatTime } from '../../../utils/date';
import { WorkoutSchedule } from '../../../types';

interface TodayScheduleListProps {
  schedules: WorkoutSchedule[];
  exerciseCountOf: (workoutId: string) => number;
  onPressItem: (schedule: WorkoutSchedule) => void;
  onViewAll: () => void;
}

/** "Lịch hôm nay" section of design 02. */
export const TodayScheduleList: React.FC<TodayScheduleListProps> = ({
  schedules,
  exerciseCountOf,
  onPressItem,
  onViewAll,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(colors);

  if (schedules.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('dashboard.today_schedule')}</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAll}>{t('common.view_all')}</Text>
        </TouchableOpacity>
      </View>

      {schedules.map((s) => (
        <TouchableOpacity key={s.id} style={styles.row} onPress={() => onPressItem(s)}>
          <View style={[styles.dot, s.isCompleted && styles.dotDone]}>
            <Icon
              name={s.isCompleted ? 'check' : 'activity'}
              size={14}
              color={s.isCompleted ? colors.black : colors.electric}
            />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle} numberOfLines={1}>
              {s.workoutName || t('notifications.workout')}
            </Text>
            <Text style={styles.rowMeta}>
              {formatTime(s.scheduledDate)} ·{' '}
              {t('dashboard.exercises_count', { count: exerciseCountOf(s.workoutId) })}
            </Text>
          </View>
          <Icon name="chevron-right" size={18} color={colors.mutedGray} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    section: { marginBottom: 20 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    title: {
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      color: colors.mutedGray,
    },
    viewAll: { fontSize: 12, fontWeight: '800', color: colors.electric },
    row: {
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
    dot: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dotDone: { backgroundColor: colors.electric },
    rowText: { flex: 1 },
    rowTitle: { fontSize: 14, fontWeight: '800', color: colors.onSurface },
    rowMeta: { fontSize: 11, color: colors.mutedGray, marginTop: 3 },
  });
