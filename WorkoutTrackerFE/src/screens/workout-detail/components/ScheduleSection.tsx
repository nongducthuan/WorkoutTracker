import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { SectionLabel, Badge } from '../../../../components/ui';
import { formatWeekdayDate, formatTime } from '../../../utils/date';
import { WorkoutSchedule } from '../../../types';

interface ScheduleSectionProps {
  schedules: WorkoutSchedule[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}

/** Upcoming sessions for this routine, shown inline on design 04. */
export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  schedules,
  onAdd,
  onDelete,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(colors);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <SectionLabel>{t('workout_detail.calendar_split')}</SectionLabel>
        <TouchableOpacity onPress={onAdd}>
          <Text style={styles.add}>{t('workout_detail.add_schedule')}</Text>
        </TouchableOpacity>
      </View>

      {schedules.length === 0 ? (
        <Text style={styles.empty}>{t('workout_detail.no_schedules')}</Text>
      ) : (
        schedules.map((s) => (
          <View key={s.id} style={styles.row}>
            <View style={styles.dateBox}>
              <Text style={styles.dateText}>{formatWeekdayDate(s.scheduledDate)}</Text>
            </View>
            <Text style={styles.time}>{formatTime(s.scheduledDate)}</Text>
            {s.isCompleted && <Badge label={t('workout_detail.completed')} tone="success" />}
            <TouchableOpacity onPress={() => onDelete(s.id)} hitSlop={8}>
              <Icon name="trash-2" size={15} color={colors.mutedGray} />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    section: { marginTop: 24 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    add: {
      fontSize: 12,
      fontWeight: '900',
      color: colors.electric,
      textTransform: 'uppercase',
      marginBottom: 12,
    },
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
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    dateText: { fontSize: 12, fontWeight: '900', color: colors.electric },
    time: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.onSurface },
  });
