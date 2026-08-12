import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';

const WEEKLY_GOAL_KEY = 'weeklyGoal';
const MIN_GOAL = 1;
const MAX_GOAL = 7;

type WeeklyGoalNav = NativeStackNavigationProp<RootStackParamList>;

export default function WeeklyGoalScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<WeeklyGoalNav>();
  const [goal, setGoal] = useState(3);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(WEEKLY_GOAL_KEY).then((val) => {
      if (val) setGoal(Number(val));
    });
  }, []);

  const decrement = () => setGoal((g) => Math.max(MIN_GOAL, g - 1));
  const increment = () => setGoal((g) => Math.min(MAX_GOAL, g + 1));

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await AsyncStorage.setItem(WEEKLY_GOAL_KEY, String(goal));
      Alert.alert(t('weekly_goal.saved'));
      navigation.goBack();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Feather name="chevron-left" size={20} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('weekly_goal.title')}</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={styles.card}>
          <Text style={styles.description}>
            {t('weekly_goal.description')}
          </Text>

          <View style={styles.stepperRow}>
            <TouchableOpacity
              onPress={decrement}
              disabled={goal <= MIN_GOAL}
              style={[styles.stepperButton, goal <= MIN_GOAL && styles.stepperButtonDisabled]}
            >
              <Feather name="minus" size={20} color={Colors.onSurface} />
            </TouchableOpacity>

            <Text style={styles.goalValue}>{goal}</Text>

            <TouchableOpacity
              onPress={increment}
              disabled={goal >= MAX_GOAL}
              style={[styles.stepperButton, goal >= MAX_GOAL && styles.stepperButtonDisabled]}
            >
              <Feather name="plus" size={20} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>

          <Text style={styles.goalLabel}>{t('weekly_goal.sessions_per_week')}</Text>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        >
          <Feather name="check-circle" size={16} color="#000000" />
          <Text style={styles.saveButtonText}>
            {isSaving ? t('profile.saving') : t('weekly_goal.save')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: Colors.onSurface,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  description: {
    color: Colors.mutedGray,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  stepperButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonDisabled: {
    opacity: 0.4,
  },
  goalValue: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.electric,
    minWidth: 64,
    textAlign: 'center',
  },
  goalLabel: {
    marginTop: 16,
    color: Colors.mutedGray,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.electric,
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(204, 255, 0, 0.5)',
  },
  saveButtonText: {
    color: '#000000',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 14,
  },
});