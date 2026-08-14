import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { SectionLabel, Badge, ProgressBar } from '../../../../components/ui';
import { getMuscleLabel } from '../../../lib/muscleMap';
import type { MuscleLoadEntry } from '../../../hooks';

interface MuscleLoadSectionProps {
  entries: MuscleLoadEntry[];
  onOpenFullMap: () => void;
}

/** Design 07b · Tải cơ theo nhóm, with the coaching suggestion at the bottom. */
export const MuscleLoadSection: React.FC<MuscleLoadSectionProps> = ({
  entries,
  onOpenFullMap,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(colors);

  const levelColor = (level: MuscleLoadEntry['level']) =>
    level === 'high'
      ? colors.error
      : level === 'medium'
        ? colors.warning
        : level === 'low'
          ? colors.electric
          : colors.border;

  const levelLabel = (level: MuscleLoadEntry['level']) =>
    ({
      high: t('reports.load_high'),
      medium: t('reports.load_medium'),
      low: t('reports.load_low'),
      none: t('reports.load_none'),
    })[level];

  const undertrained = entries
    .filter((e) => e.level === 'low' || e.level === 'none')
    .slice(0, 2)
    .map((e) => getMuscleLabel(e.muscle));

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <SectionLabel>{t('reports.muscle_load_title')}</SectionLabel>
        <Badge label={t('reports.muscle_load_range')} tone="muted" />
      </View>

      <View style={styles.card}>
        <View style={styles.legendRow}>
          <Text style={styles.legendLabel}>{t('reports.load_level')}</Text>
          {(['high', 'medium', 'low', 'none'] as const).map((level) => (
            <View key={level} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: levelColor(level) }]} />
              <Text style={styles.legendText}>{levelLabel(level)}</Text>
            </View>
          ))}
        </View>

        {entries.length === 0 ? (
          <Text style={styles.empty}>{t('reports.no_history')}</Text>
        ) : (
          entries.slice(0, 6).map((entry) => (
            <View key={entry.muscle} style={styles.row}>
              <Text style={styles.muscle}>{getMuscleLabel(entry.muscle)}</Text>
              <ProgressBar
                value={entry.ratio}
                color={levelColor(entry.level)}
                style={styles.bar}
              />
              <Text style={styles.percent}>{Math.round(entry.ratio * 100)}%</Text>
            </View>
          ))
        )}

        <View style={styles.suggestion}>
          <Icon name="info" size={14} color={colors.electric} />
          <Text style={styles.suggestionText}>
            <Text style={styles.suggestionLabel}>{t('reports.suggestion_label')} </Text>
            {undertrained.length
              ? t('reports.suggestion_body', { muscles: undertrained.join(', ') })
              : t('reports.suggestion_balanced')}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.fullMapBtn} onPress={onOpenFullMap}>
        <Icon name="maximize-2" size={15} color={colors.electric} />
        <Text style={styles.fullMapText}>{t('reports.open_full_map')}</Text>
      </TouchableOpacity>
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
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
    },
    legendRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    legendLabel: {
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.mutedGray,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 10, color: colors.mutedGray },
    empty: { fontSize: 12, color: colors.mutedGray, paddingVertical: 8 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    muscle: { width: 96, fontSize: 12, fontWeight: '700', color: colors.onSurface },
    bar: { flex: 1 },
    percent: { width: 40, textAlign: 'right', fontSize: 11, fontWeight: '800', color: colors.mutedGray },
    suggestion: {
      flexDirection: 'row',
      gap: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 14,
      marginTop: 6,
    },
    suggestionText: { flex: 1, fontSize: 12, color: colors.mutedGray, lineHeight: 18 },
    suggestionLabel: { color: colors.electric, fontWeight: '900' },
    fullMapBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      marginTop: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    fullMapText: { fontSize: 12, fontWeight: '900', color: colors.electric },
  });
