import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PrimaryButton, Badge } from '../../../../components/ui';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { formatTime } from '../../../utils/date';

interface TodaySessionCardProps {
  workoutName: string;
  exerciseCount: number;
  muscles: string[];
  scheduledDate: string;
  onStart: () => void;
}

/** Hero card of design 02: today's session with a one-tap start. */
export const TodaySessionCard: React.FC<TodaySessionCardProps> = ({
  workoutName,
  exerciseCount,
  muscles,
  scheduledDate,
  onStart,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(colors);

  const meta = [
    t('dashboard.exercises_count', { count: exerciseCount }),
    muscles.length ? muscles.join(', ') : null,
    formatTime(scheduledDate),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.card}>
      <Badge label={t('dashboard.todays_session_title')} tone="electric" />
      <Text style={styles.name}>{workoutName}</Text>
      <Text style={styles.meta}>{meta}</Text>
      <PrimaryButton
        label={t('dashboard.start')}
        icon="play"
        onPress={onStart}
        style={styles.button}
      />
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.electricBgStrong,
      borderRadius: 16,
      padding: 18,
      marginBottom: 20,
    },
    name: {
      fontSize: 22,
      fontWeight: '900',
      color: colors.onSurface,
      marginTop: 14,
    },
    meta: { fontSize: 12, color: colors.mutedGray, marginTop: 6, marginBottom: 18 },
    button: { alignSelf: 'flex-start', paddingHorizontal: 26 },
  });
