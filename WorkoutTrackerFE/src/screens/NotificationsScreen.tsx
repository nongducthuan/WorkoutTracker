import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSchedules } from '../hooks/useFitnessData';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';

const REMINDER_KEY = 'reminderBefore30Min';

type NotificationsNav = NativeStackNavigationProp<RootStackParamList>;

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NotificationsNav>();
  const { schedules } = useSchedules();
  const [reminderEnabled, setReminderEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(REMINDER_KEY).then((val) => {
      if (val !== null) setReminderEnabled(val === 'true');
    });
  }, []);

  const toggleReminder = (value: boolean) => {
    setReminderEnabled(value);
    AsyncStorage.setItem(REMINDER_KEY, String(value));
  };

  // Notification feed derived from real upcoming schedules, no fake data.
  const upcoming = [...schedules]
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 5);

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Feather name="chevron-left" size={20} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={styles.reminderCard}>
          <View style={styles.reminderLeft}>
            <Feather name="bell" size={18} color={colors.electric} />
            <Text style={styles.reminderText}>
              {t('notifications.remind_before_30')}
            </Text>
          </View>
          <Switch
            value={reminderEnabled}
            onValueChange={toggleReminder}
            trackColor={{ false: colors.borderGray, true: colors.electric }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Text style={styles.sectionLabel}>{t('notifications.upcoming')}</Text>

        {upcoming.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="inbox" size={32} color={colors.mutedGray} />
            <Text style={styles.emptyText}>
              {t('notifications.empty')}
            </Text>
          </View>
        ) : (
          upcoming.map((s) => (
            <View key={s.id} style={styles.notifCard}>
              <View style={styles.notifIcon}>
                <Feather name="calendar" size={16} color={colors.electric} />
              </View>
              <View style={styles.notifBody}>
                <Text style={styles.notifTitle}>{s.workoutName || t('notifications.workout')}</Text>
                <Text style={styles.notifSubtitle}>
                  {new Date(s.scheduledDate).toLocaleString('vi-VN', {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          ))
        )}
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: colors.onSurface,
    textTransform: 'uppercase',
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reminderText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.mutedGray,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBody: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  notifSubtitle: {
    fontSize: 11,
    color: colors.mutedGray,
    marginTop: 2,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    color: colors.mutedGray,
    fontSize: 13,
    textAlign: 'center',
  },
});