import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';

interface SetRowProps {
  index: number;
  reps: number;
  weightLabel: string;
  done: boolean;
  onToggle: () => void;
}

/** One "Hiệp N · 10 lần · 22 kg" row with its completion checkbox (design 04b). */
export const SetRow: React.FC<SetRowProps> = ({ index, reps, weightLabel, done, onToggle }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(colors);

  return (
    <TouchableOpacity style={[styles.row, done && styles.rowDone]} onPress={onToggle}>
      <View style={[styles.check, done && styles.checkDone]}>
        {done ? (
          <Icon name="check" size={15} color={colors.black} />
        ) : (
          <Text style={styles.checkText}>{index}</Text>
        )}
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, done && styles.titleDone]}>
          {t('active_workout.set', { index })}
        </Text>
        <Text style={styles.meta}>
          {t('active_workout.set_detail', { reps, weight: weightLabel })}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    rowDone: { borderColor: colors.electric, backgroundColor: colors.electricBg },
    check: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkDone: { backgroundColor: colors.electric, borderColor: colors.electric },
    checkText: { fontSize: 13, fontWeight: '900', color: colors.mutedGray },
    textWrap: { flex: 1 },
    title: { fontSize: 14, fontWeight: '800', color: colors.onSurface },
    titleDone: { color: colors.electric },
    meta: { fontSize: 11, color: colors.mutedGray, marginTop: 3 },
  });
