import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { MuscleMap, MUSCLE_INTENSITY_COLORS } from '../../../../components/MuscleMap';
import { SegmentedControl } from '../../../../components/ui';
import { MuscleId } from '../../../lib/muscleMap';

export type BodyView = 'front' | 'back';

interface MuscleScannerProps {
  primary: MuscleId[];
  secondary: MuscleId[];
  view: BodyView;
  onChangeView: (view: BodyView) => void;
  onSelectMuscle: (muscle: MuscleId) => void;
}

/**
 * "Thư viện động tác" scanner (design 05) — including the Mặt trước / Mặt sau
 * toggle, which the previous implementation was missing entirely.
 */
export const MuscleScanner: React.FC<MuscleScannerProps> = ({
  primary,
  secondary,
  view,
  onChangeView,
  onSelectMuscle,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(colors);

  return (
    <View style={styles.card}>
      <SegmentedControl<BodyView>
        value={view}
        onChange={onChangeView}
        options={[
          { value: 'front', label: t('exercises.view_front') },
          { value: 'back', label: t('exercises.view_back') },
        ]}
      />

      <Text style={styles.hint}>{t('exercises.tap_muscle_hint')}</Text>

      <MuscleMap
        primaryMuscles={primary}
        secondaryMuscles={secondary}
        view={view}
        size="md"
        onMuscleClick={onSelectMuscle}
      />

      <View style={styles.legend}>
        {[
          { color: MUSCLE_INTENSITY_COLORS.moderate, label: t('exercises.legend_primary') },
          { color: MUSCLE_INTENSITY_COLORS.low, label: t('exercises.legend_secondary') },
          { color: colors.border, label: t('exercises.legend_inactive') },
        ].map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
    },
    hint: {
      fontSize: 11,
      color: colors.mutedGray,
      textAlign: 'center',
      marginTop: 14,
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 14,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 10, color: colors.mutedGray, fontWeight: '700' },
  });
