import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { Badge } from '../../../../components/ui';
import { formatRelativeDay } from '../../../utils/date';
import { Workout } from '../../../types';
import { categoryLabel } from '../../../lib/categoryLabels';

interface WorkoutCardProps {
  workout: Workout;
  exerciseCount: number;
  muscles: string[];
  lastPerformed?: string;
  isToday: boolean;
  onPress: () => void;
  onDelete: () => void;
}

/**
 * Row of design 03: name + "Hôm nay" badge, description, muscle groups and the
 * "N bài tập · lần cuối X ngày trước" footer.
 */
export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  exerciseCount,
  muscles,
  lastPerformed,
  isToday,
  onPress,
  onDelete,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(colors);

  const footer = [
    t('workouts.exercise_count', { count: exerciseCount }),
    lastPerformed
      ? t('workouts.last_performed', { when: formatRelativeDay(lastPerformed) })
      : t('workouts.never_performed'),
  ].join(' · ');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.titleRow}>
        <Text style={styles.name} numberOfLines={1}>
          {workout.name}
        </Text>
        {isToday && <Badge label={t('workouts.today_badge')} tone="electric" />}
        <TouchableOpacity onPress={onDelete} hitSlop={10}>
          <Icon name="trash-2" size={17} color={colors.mutedGray} />
        </TouchableOpacity>
      </View>

      {!!workout.description && (
        <Text style={styles.description} numberOfLines={2}>
          {workout.description}
        </Text>
      )}

      {muscles.length > 0 && (
        <View style={styles.muscleRow}>
          {muscles.slice(0, 4).map((m) => (
            <View key={m} style={styles.muscleTag}>
              <Text style={styles.muscleTagText}>{categoryLabel(m)}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footerRow}>
        <Text style={styles.footer}>{footer}</Text>
        <Icon name="chevron-right" size={16} color={colors.mutedGray} />
      </View>
    </TouchableOpacity>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
      marginBottom: 14,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    name: { flex: 1, fontSize: 17, fontWeight: '900', color: colors.onSurface },
    description: { fontSize: 13, color: colors.mutedGray, marginTop: 8, lineHeight: 19 },
    muscleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
    muscleTag: {
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    muscleTagText: { fontSize: 10, fontWeight: '700', color: colors.mutedGray },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 14,
    },
    footer: { fontSize: 11, color: colors.mutedGray, fontWeight: '600' },
  });
