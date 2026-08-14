import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { useSettings, AppSettings } from '../../context/SettingsContext';
import { PrimaryButton, Stepper, SectionLabel, Chip } from '../../../components/ui';

type OnboardingNav = NativeStackNavigationProp<RootStackParamList>;
type OnboardingRoute = RouteProp<RootStackParamList, 'OnboardingGoal'>;

type Goal = AppSettings['goal'];
type Level = AppSettings['level'];

/** Design 01e · Onboarding. Reached right after registration. */
export default function OnboardingGoalScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<OnboardingNav>();
  const route = useRoute<OnboardingRoute>();
  const { settings, updateSettings } = useSettings();

  /**
   * The same screen serves two jobs: the one-time step after registering, and
   * the editor reached from "Hồ sơ". The answers now drive the set/rep defaults
   * and the catalogue's level filter, so they have to stay changeable — but
   * reopening them must return where the user came from rather than dropping
   * them at the dashboard.
   */
  const isEditing = !!route.params?.fromSettings;

  const [goal, setGoal] = useState<Goal>(settings.goal);
  const [level, setLevel] = useState<Level>(settings.level);
  const [daysPerWeek, setDaysPerWeek] = useState(settings.weeklyGoal);
  const [isSaving, setSaving] = useState(false);

  const goals: { key: Goal; icon: string; label: string; desc: string }[] = [
    {
      key: 'muscle',
      icon: 'trending-up',
      label: t('onboarding.goal_muscle'),
      desc: t('onboarding.goal_muscle_desc'),
    },
    {
      key: 'fat_loss',
      icon: 'activity',
      label: t('onboarding.goal_weight'),
      desc: t('onboarding.goal_fat_desc'),
    },
    {
      key: 'endurance',
      icon: 'wind',
      label: t('onboarding.goal_active'),
      desc: t('onboarding.goal_endurance_desc'),
    },
  ];

  const levels: { key: Level; label: string }[] = [
    { key: 'beginner', label: t('onboarding.level_beginner') },
    { key: 'intermediate', label: t('onboarding.level_intermediate') },
    { key: 'advanced', label: t('onboarding.level_advanced') },
  ];

  const leave = () => {
    if (isEditing && navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const finish = async (skip = false) => {
    setSaving(true);
    try {
      if (!skip) {
        await updateSettings({
          goal,
          level,
          weeklyGoal: daysPerWeek,
          onboardingCompleted: true,
        });
      } else {
        await updateSettings({ onboardingCompleted: true });
      }
      leave();
    } finally {
      setSaving(false);
    }
  };

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Editing, this is a plain cancel — nothing is written and the flag is
            already set. During onboarding it still has to record the skip. */}
        <TouchableOpacity style={styles.skip} onPress={() => (isEditing ? leave() : finish(true))}>
          <Text style={styles.skipText}>
            {isEditing ? t('common.cancel') : t('common.skip')}
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t('onboarding.screen_title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.screen_subtitle')}</Text>

        {goals.map((item) => {
          const active = goal === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.goalCard, active && styles.goalCardActive]}
              onPress={() => setGoal(item.key)}
            >
              <View style={[styles.goalIcon, active && styles.goalIconActive]}>
                <Icon
                  name={item.icon as any}
                  size={20}
                  color={active ? colors.black : colors.mutedGray}
                />
              </View>
              <View style={styles.goalText}>
                <Text style={[styles.goalLabel, active && styles.goalLabelActive]}>
                  {item.label}
                </Text>
                <Text style={styles.goalDesc}>{item.desc}</Text>
              </View>
              {active && <Icon name="check-circle" size={20} color={colors.electric} />}
            </TouchableOpacity>
          );
        })}

        <SectionLabel style={styles.sectionSpacing}>{t('onboarding.level_title')}</SectionLabel>
        <View style={styles.levelRow}>
          {levels.map((item) => (
            <Chip
              key={item.key}
              label={item.label}
              active={level === item.key}
              onPress={() => setLevel(item.key)}
              style={styles.levelChip}
            />
          ))}
        </View>

        <SectionLabel style={styles.sectionSpacing}>{t('onboarding.days_title')}</SectionLabel>
        <Stepper
          value={daysPerWeek}
          onChange={setDaysPerWeek}
          min={1}
          max={7}
          unit={t('onboarding.days_unit')}
        />

        <PrimaryButton
          label={t('common.continue')}
          onPress={() => finish(false)}
          loading={isSaving}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 24, paddingBottom: 40 },
    skip: { alignSelf: 'flex-end', paddingVertical: 6, paddingHorizontal: 8 },
    skipText: { fontSize: 13, fontWeight: '800', color: colors.mutedGray },
    title: { fontSize: 24, fontWeight: '900', color: colors.onSurface, marginTop: 8 },
    subtitle: { fontSize: 13, color: colors.mutedGray, marginTop: 8, marginBottom: 24 },
    goalCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
    },
    goalCardActive: { borderColor: colors.electric, backgroundColor: colors.electricBg },
    goalIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    goalIconActive: { backgroundColor: colors.electric },
    goalText: { flex: 1 },
    goalLabel: { fontSize: 14, fontWeight: '900', color: colors.onSurface },
    goalLabelActive: { color: colors.electric },
    goalDesc: { fontSize: 11, color: colors.mutedGray, marginTop: 3 },
    sectionSpacing: { marginTop: 24 },
    levelRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
    levelChip: { flex: 1, alignItems: 'center' },
  });
