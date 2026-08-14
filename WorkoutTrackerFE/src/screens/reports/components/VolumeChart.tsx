import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { SectionLabel, Badge } from '../../../../components/ui';
import { toTons } from '../../../utils/format';

export interface VolumeBar {
  label: string;
  volume: number;
}

interface VolumeChartProps {
  bars: VolumeBar[];
}

/** "Khối lượng theo tuần" chart of design 07, drawn with plain views. */
export const VolumeChart: React.FC<VolumeChartProps> = ({ bars }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(colors);

  const max = Math.max(1, ...bars.map((b) => b.volume));

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <SectionLabel>{t('reports.weekly_volume')}</SectionLabel>
        <Badge label={t('reports.weeks_range')} tone="muted" />
      </View>

      <View style={styles.chart}>
        {bars.map((bar, idx) => (
          <View key={`${bar.label}-${idx}`} style={styles.column}>
            <Text style={styles.value}>{bar.volume > 0 ? toTons(bar.volume) : '—'}</Text>
            <View
              style={[
                styles.bar,
                {
                  height: Math.max(4, (bar.volume / max) * 110),
                  backgroundColor: idx === bars.length - 1 ? colors.electric : colors.electricDim,
                },
              ]}
            />
            <Text style={styles.label}>{bar.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: { marginBottom: 24 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    chart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 14,
      minHeight: 170,
    },
    column: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
    value: { fontSize: 9, color: colors.mutedGray, fontWeight: '700' },
    bar: { width: '70%', borderRadius: 4 },
    label: { fontSize: 10, color: colors.mutedGray, fontWeight: '700' },
  });
