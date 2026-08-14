import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { SectionLabel, Badge } from '../../../../components/ui';
import { formatShortDate } from '../../../utils/date';

interface ActivityItem {
  id: string;
  date: string;
  workoutName: string;
  exercisesCount: number;
}

/** "Hoạt động gần đây" list of design 07. */
export const RecentActivity: React.FC<{ items: ActivityItem[] }> = ({ items }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(colors);

  return (
    <View style={styles.wrap}>
      <SectionLabel>{t('reports.recent_activity')}</SectionLabel>
      {items.length === 0 ? (
        <Text style={styles.empty}>{t('reports.no_history')}</Text>
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={styles.textWrap}>
              <Text style={styles.name}>{item.workoutName}</Text>
              <Text style={styles.meta}>
                {formatShortDate(item.date)} ·{' '}
                {t('workouts.exercise_count', { count: item.exercisesCount })}
              </Text>
            </View>
            <Badge label={t('reports.completed')} tone="success" />
          </View>
        ))
      )}
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: { marginBottom: 12 },
    empty: { fontSize: 12, color: colors.mutedGray },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
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
