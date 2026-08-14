import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { useSettings } from '../../../context/SettingsContext';
import { formatWeight } from '../../../utils/format';
import { WorkoutExercise } from '../../../types';

interface ExerciseRowProps {
  index: number;
  exercise: WorkoutExercise;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Numbered exercise row of design 04: "1 · Bench Press · 4 hiệp x 8 lần · 60 kg". */
export const ExerciseRow: React.FC<ExerciseRowProps> = ({
  index,
  exercise,
  onPress,
  onEdit,
  onDelete,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const styles = makeStyles(colors);

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.indexBadge}>
        <Text style={styles.indexText}>{index}</Text>
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.name} numberOfLines={1}>
          {exercise.exerciseName || `#${exercise.exerciseId}`}
        </Text>
        <Text style={styles.meta}>
          {t('workout_detail.sets')} {exercise.sets} × {exercise.repetitions}{' '}
          {t('workout_detail.reps').toLowerCase()}
        </Text>
      </View>

      <Text style={styles.weight}>{formatWeight(exercise.weight || 0, settings.weightUnit)}</Text>

      <TouchableOpacity onPress={onEdit} hitSlop={8} style={styles.action}>
        <Icon name="edit-2" size={15} color={colors.mutedGray} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} hitSlop={8} style={styles.action}>
        <Icon name="trash-2" size={15} color={colors.mutedGray} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
    },
    indexBadge: {
      width: 26,
      height: 26,
      borderRadius: 8,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    indexText: { fontSize: 12, fontWeight: '900', color: colors.electric },
    textWrap: { flex: 1 },
    name: { fontSize: 14, fontWeight: '800', color: colors.onSurface },
    meta: { fontSize: 11, color: colors.mutedGray, marginTop: 3 },
    weight: { fontSize: 13, fontWeight: '900', color: colors.electric },
    action: { padding: 4 },
  });
