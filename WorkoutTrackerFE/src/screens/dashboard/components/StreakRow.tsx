import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StatCard } from '../../../../components/ui';

interface StreakRowProps {
  streakDays: number;
  weeklyDone: number;
  weeklyGoal: number;
}

/** "Chuỗi ngày 7" + "Tuần này 2/3" pair from design 02. */
export const StreakRow: React.FC<StreakRowProps> = ({ streakDays, weeklyDone, weeklyGoal }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      <StatCard
        label={t('dashboard.streak_label')}
        value={streakDays}
        unit={t('dashboard.streak_unit')}
        icon="zap"
        highlight
      />
      <StatCard
        label={t('dashboard.this_week')}
        value={weeklyDone}
        unit={`/${weeklyGoal} ${t('dashboard.sessions_unit')}`}
        icon="target"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginBottom: 20 },
});
