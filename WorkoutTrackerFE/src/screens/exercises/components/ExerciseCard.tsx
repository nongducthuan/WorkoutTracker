import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { Badge } from '../../../../components/ui';
import { Exercise } from '../../../types';
import { categoryLabel } from '../../../lib/categoryLabels';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress: () => void;
}

/** Catalogue row of design 05: name, "Ngực · Tạ đòn", difficulty badge. */
export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onPress }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(colors);

  const difficultyKey = (exercise.difficulty || '').toLowerCase();
  const difficultyLabel = difficultyKey.startsWith('begin')
    ? t('difficulty.beginner')
    : difficultyKey.startsWith('inter')
      ? t('difficulty.intermediate')
      : difficultyKey.startsWith('adv')
        ? t('difficulty.advanced')
        : exercise.difficulty;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.textWrap}>
        <Text style={styles.name} numberOfLines={1}>
          {exercise.name}
        </Text>
        {!!exercise.category && <Text style={styles.meta}>{categoryLabel(exercise.category)}</Text>}
      </View>
      {!!difficultyLabel && <Badge label={difficultyLabel} tone="muted" />}
      <Icon name="chevron-right" size={16} color={colors.mutedGray} />
    </TouchableOpacity>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
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
    textWrap: { flex: 1 },
    name: { fontSize: 14, fontWeight: '800', color: colors.onSurface },
    meta: { fontSize: 11, color: colors.mutedGray, marginTop: 3 },
  });
