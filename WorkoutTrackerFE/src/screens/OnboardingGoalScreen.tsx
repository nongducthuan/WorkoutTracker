import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';

type OnboardingGoalNav = NativeStackNavigationProp<RootStackParamList>;

const GOALS = [
  { key: 'muscle', icon: 'trending-up', label: 'Tăng cơ', desc: 'Xây dựng khối lượng cơ bắp' },
  { key: 'fat_loss', icon: 'activity', label: 'Giảm mỡ', desc: 'Cải thiện vóc dáng và sức khỏe' },
  { key: 'endurance', icon: 'wind', label: 'Sức bền', desc: 'Duy trì thể lực bền vững' },
];

const LEVELS = [
  { key: 'beginner', label: 'Mới bắt đầu' },
  { key: 'intermediate', label: 'Trung cấp' },
  { key: 'advanced', label: 'Nâng cao' },
];

export default function OnboardingGoalScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<OnboardingGoalNav>();
  const [goal, setGoal] = useState('muscle');
  const [level, setLevel] = useState('beginner');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [isSaving, setIsSaving] = useState(false);

  const GOALS = [
    { key: 'muscle', icon: 'trending-up', label: t('onboarding.goal_muscle', 'Build Muscle'), desc: t('onboarding.step1_desc') },
    { key: 'fat_loss', icon: 'activity', label: t('onboarding.goal_weight', 'Lose Weight'), desc: t('onboarding.step1_desc') },
    { key: 'endurance', icon: 'wind', label: t('onboarding.goal_active', 'Stay Active'), desc: t('onboarding.step1_desc') },
  ];

  const LEVELS = [
    { key: 'beginner', label: t('onboarding.level_beginner', 'Complete Beginner') },
    { key: 'intermediate', label: t('onboarding.level_intermediate', 'Some Experience') },
    { key: 'advanced', label: t('onboarding.level_expert', 'Experienced Athlete') },
  ];

  const handleContinue = async () => {
    try {
      setIsSaving(true);
      await AsyncStorage.setItem(
        'onboardingGoal',
        JSON.stringify({ goal, level, daysPerWeek })
      );
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } finally {
      setIsSaving(false);
    }
  };

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t('onboarding.step1_title')} PULSE</Text>
        <Text style={styles.subtitle}>{t('onboarding.step1_desc')}</Text>

        <View style={{ gap: 12, marginBottom: 28 }}>
          {GOALS.map((g) => {
            const active = goal === g.key;
            return (
              <TouchableOpacity
                key={g.key}
                onPress={() => setGoal(g.key)}
                style={[styles.goalCard, active && styles.goalCardActive]}
              >
                <View style={[styles.goalIcon, active && styles.goalIconActive]}>
                  <Feather name={g.icon as any} size={20} color={active ? colors.black : colors.mutedGray} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.goalLabel, active && styles.goalLabelActive]}>{g.label}</Text>
                  <Text style={styles.goalDesc}>{g.desc}</Text>
                </View>
                {active && <Feather name="check-circle" size={20} color={colors.electric} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>{t('onboarding.step2_title')}</Text>
        <View style={styles.levelRow}>
          {LEVELS.map((l) => {
            const active = level === l.key;
            return (
              <TouchableOpacity
                key={l.key}
                onPress={() => setLevel(l.key)}
                style={[styles.levelChip, active && styles.levelChipActive]}
              >
                <Text style={[styles.levelChipText, active && styles.levelChipTextActive]}>
                  {l.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>{t('dashboard.days_label', 'Days')} / {t('dashboard.goal_label', 'goal')}</Text>
        <View style={styles.stepperCard}>
          <TouchableOpacity
            onPress={() => setDaysPerWeek((d) => Math.max(1, d - 1))}
            style={styles.stepperButton}
          >
            <Feather name="minus" size={18} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{daysPerWeek}</Text>
          <TouchableOpacity
            onPress={() => setDaysPerWeek((d) => Math.min(7, d + 1))}
            style={styles.stepperButton}
          >
            <Feather name="plus" size={18} color={colors.onSurface} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleContinue}
          disabled={isSaving}
          style={[styles.continueButton, isSaving && styles.continueButtonDisabled]}
        >
          <Text style={styles.continueButtonText}>{isSaving ? t('profile.saving') : t('onboarding.use_template')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.onSurface,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.mutedGray,
    marginBottom: 24,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 14,
    padding: 16,
  },
  goalCardActive: {
    borderColor: colors.electric,
    backgroundColor: 'rgba(198,244,50,0.06)',
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalIconActive: {
    backgroundColor: colors.electric,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  goalLabelActive: {
    color: colors.electric,
  },
  goalDesc: {
    fontSize: 11,
    color: colors.mutedGray,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.mutedGray,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
  },
  levelChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderGray,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  levelChipActive: {
    backgroundColor: colors.electric,
    borderColor: 'transparent',
  },
  levelChipText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.mutedGray,
    textTransform: 'uppercase',
  },
  levelChipTextActive: {
    color: colors.black,
  },
  stepperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 32,
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.electric,
    minWidth: 40,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: colors.electric,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(204, 255, 0, 0.5)',
  },
  continueButtonText: {
    color: colors.black,
    fontWeight: '900',
    fontSize: 15,
  },
});