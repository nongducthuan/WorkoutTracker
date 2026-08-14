import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../../components/Toast';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { SectionLabel, PrimaryButton, ToggleRow, SettingsGroup } from '../../../components/ui';
import { weekdayHeadings } from '../../utils/date';

const GOAL_OPTIONS = [2, 3, 4, 5, 6];

/** Design 08c · Mục tiêu tuần. */
export default function WeeklyGoalScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { settings, updateSettings } = useSettings();
  const { success } = useToast();

  const [goal, setGoal] = useState(settings.weeklyGoal);
  const [days, setDays] = useState<number[]>(settings.preferredDays);
  const [autoSchedule, setAutoSchedule] = useState(settings.autoSchedule);

  const toggleDay = (index: number) =>
    setDays((prev) =>
      prev.includes(index) ? prev.filter((d) => d !== index) : [...prev, index].sort()
    );

  const save = async () => {
    await updateSettings({ weeklyGoal: goal, preferredDays: days, autoSchedule });
    success(t('weekly_goal.saved'));
    navigation.goBack();
  };

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title={t('weekly_goal.title')} />

        <SectionLabel>{t('weekly_goal.sessions_title')}</SectionLabel>
        <View style={styles.goalRow}>
          {GOAL_OPTIONS.map((value) => (
            <TouchableOpacity
              key={value}
              style={[styles.goalChip, goal === value && styles.goalChipActive]}
              onPress={() => setGoal(value)}
            >
              <Text style={[styles.goalChipText, goal === value && styles.goalChipTextActive]}>
                {value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.goalDescription}>{t(`weekly_goal.desc_${goal}`)}</Text>

        <SectionLabel style={styles.daysLabel}>{t('weekly_goal.preferred_days')}</SectionLabel>
        <Text style={styles.daysHint}>{t('weekly_goal.pick_days', { count: goal })}</Text>
        <View style={styles.dayRow}>
          {weekdayHeadings().map((label, index) => (
            <TouchableOpacity
              key={label}
              style={[styles.dayChip, days.includes(index) && styles.dayChipActive]}
              onPress={() => toggleDay(index)}
            >
              <Text
                style={[styles.dayChipText, days.includes(index) && styles.dayChipTextActive]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <SettingsGroup style={styles.toggleGroup}>
          <ToggleRow
            icon="repeat"
            label={t('weekly_goal.auto_schedule')}
            description={t('weekly_goal.auto_schedule_desc')}
            value={autoSchedule}
            onChange={setAutoSchedule}
          />
        </SettingsGroup>

        <PrimaryButton label={t('weekly_goal.save')} onPress={save} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    goalRow: { flexDirection: 'row', gap: 10 },
    goalChip: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    goalChipActive: { backgroundColor: colors.electric, borderColor: colors.electric },
    goalChipText: { fontSize: 18, fontWeight: '900', color: colors.mutedGray },
    goalChipTextActive: { color: colors.black },
    goalDescription: {
      fontSize: 12,
      color: colors.mutedGray,
      lineHeight: 19,
      marginTop: 14,
    },
    daysLabel: { marginTop: 28 },
    daysHint: { fontSize: 11, color: colors.mutedGray, marginBottom: 12, marginTop: -6 },
    dayRow: { flexDirection: 'row', gap: 6 },
    dayChip: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: 'center',
    },
    dayChipActive: { backgroundColor: colors.electric, borderColor: colors.electric },
    dayChipText: { fontSize: 11, fontWeight: '800', color: colors.mutedGray },
    dayChipTextActive: { color: colors.black },
    toggleGroup: { marginTop: 24 },
  });
