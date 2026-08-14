import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { formatDuration } from '../../../utils/date';

interface RestBarProps {
  secondsLeft: number;
  onExtend: () => void;
  onSkip: () => void;
}

/** The "Đang nghỉ 0:52 · +30s · Bỏ qua nghỉ" bar of design 04b. */
export const RestBar: React.FC<RestBarProps> = ({ secondsLeft, onExtend, onSkip }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(colors);

  return (
    <View style={styles.bar}>
      <View style={styles.textWrap}>
        <Text style={styles.label}>{t('active_workout.resting')}</Text>
        <Text style={styles.timer}>{formatDuration(secondsLeft)}</Text>
      </View>
      <TouchableOpacity style={styles.extend} onPress={onExtend}>
        <Text style={styles.extendText}>{t('active_workout.add_30')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onSkip}>
        <Text style={styles.skip}>{t('active_workout.skip_rest')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: colors.electricBgStrong,
      borderWidth: 1,
      borderColor: colors.electric,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    textWrap: { flex: 1 },
    label: {
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.electric,
    },
    timer: { fontSize: 22, fontWeight: '900', color: colors.onSurface, marginTop: 2 },
    extend: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: colors.electric,
    },
    extendText: { fontSize: 12, fontWeight: '900', color: colors.electric },
    skip: { fontSize: 12, fontWeight: '800', color: colors.mutedGray },
  });
