import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { SectionLabel, Badge } from '../../../../components/ui';
import { formatWeekdayDate, formatTime } from '../../../utils/date';
import { WorkoutSchedule } from '../../../types';

interface UpcomingListProps {
  title?: string;
  schedules: WorkoutSchedule[];
  onPress: (schedule: WorkoutSchedule) => void;
  onComplete: (schedule: WorkoutSchedule) => void;
  onDelete: (schedule: WorkoutSchedule) => void;
}

/** "Sắp tới" list of design 06. */
export const UpcomingList: React.FC<UpcomingListProps> = ({
  title,
  schedules,
  onPress,
  onComplete,
  onDelete,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(colors);

  return (
    <View>
      <SectionLabel>{title || t('schedule.upcoming')}</SectionLabel>
      {schedules.length === 0 ? (
        <Text style={styles.empty}>{t('schedule.empty_desc')}</Text>
      ) : (
        schedules.map((s) => (
          <TouchableOpacity key={s.id} style={styles.row} onPress={() => onPress(s)}>
            <View style={styles.dateBox}>
              <Text style={styles.dateText}>{formatWeekdayDate(s.scheduledDate)}</Text>
            </View>

            <View style={styles.textWrap}>
              <Text style={styles.name} numberOfLines={1}>
                {s.workoutName || t('notifications.workout')}
              </Text>
              <Text style={styles.time}>{formatTime(s.scheduledDate)}</Text>
            </View>

            {s.isCompleted ? (
              <Badge label={t('reports.completed')} tone="success" />
            ) : (
              <TouchableOpacity onPress={() => onComplete(s)} hitSlop={8} style={styles.action}>
                <Icon name="check-circle" size={18} color={colors.electric} />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => onDelete(s)} hitSlop={8} style={styles.action}>
              <Icon name="trash-2" size={16} color={colors.mutedGray} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    empty: { fontSize: 12, color: colors.mutedGray },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
    },
    dateBox: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    dateText: { fontSize: 12, fontWeight: '900', color: colors.electric },
    textWrap: { flex: 1 },
    name: { fontSize: 14, fontWeight: '800', color: colors.onSurface },
    time: { fontSize: 11, color: colors.mutedGray, marginTop: 3 },
    action: { padding: 4 },
  });
