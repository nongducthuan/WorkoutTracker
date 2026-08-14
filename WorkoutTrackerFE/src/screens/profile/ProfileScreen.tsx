import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { useSettings } from '../../context/SettingsContext';
import { useCurrentUser, useReports, useSchedules } from '../../hooks';
import { authApi } from '../../api/auth';
import { AppLanguage } from '../../i18n';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import {
  StatCard,
  SettingsGroup,
  NavRow,
  ToggleRow,
  SegmentedControl,
  DangerButton,
} from '../../../components/ui';
import { goalLabelKey, levelLabelKey } from '../../lib/trainingPrescription';
import { initialsOf } from '../../utils/format';
import { isoWeekNumber } from '../../utils/date';

type ProfileNav = NativeStackNavigationProp<RootStackParamList>;

/** Design 08 · Hồ sơ. */
export default function ProfileScreen() {
  const { colors, isDark, setThemeMode } = useTheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<ProfileNav>();
  const { settings, updateSettings, setLanguage } = useSettings();

  const { user, displayName } = useCurrentUser();
  const { stats } = useReports();
  /**
   * Two years is the window the streak below is counted over — enough that no
   * realistic run of consecutive weeks is cut short, while keeping the profile
   * from downloading an account's entire schedule history to show one number.
   */
  const streakFrom = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 2);
    return d.toISOString();
  }, []);
  const { schedules } = useSchedules({ from: streakFrom });
  const [isLogoutOpen, setLogoutOpen] = useState(false);

  /** Consecutive ISO weeks (ending this week) with at least one session. */
  const activeWeeks = useMemo(() => {
    const weeks = new Set(
      schedules
        .filter((s) => s.isCompleted)
        .map((s) => isoWeekNumber(s.scheduledDate))
    );
    let count = 0;
    let week = isoWeekNumber(new Date());
    while (weeks.has(week)) {
      count += 1;
      week -= 1;
    }
    return count;
  }, [schedules]);

  const handleLogout = async () => {
    setLogoutOpen(false);
    await authApi.logout();
    navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
  };

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title={t('profile.title')} />

        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initialsOf(displayName)}</Text>
          </View>
          <Text style={styles.name}>{displayName || '—'}</Text>
          <Text style={styles.email}>{user?.email || `@${user?.userName ?? ''}`}</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            label={t('profile.stat_sessions')}
            value={stats?.totalWorkouts ?? 0}
            highlight
          />
          <StatCard label={t('profile.stat_streak')} value={stats?.streakDays ?? 0} />
          <StatCard label={t('profile.stat_weeks')} value={activeWeeks} />
        </View>

        <SettingsGroup>
          <View style={styles.inlineRow}>
            <Text style={styles.inlineLabel}>{t('profile.language')}</Text>
            <SegmentedControl<AppLanguage>
              compact
              value={(i18n.language.startsWith('en') ? 'en' : 'vi') as AppLanguage}
              onChange={setLanguage}
              options={[
                { value: 'vi', label: 'VI' },
                { value: 'en', label: 'EN' },
              ]}
            />
          </View>
          <View style={styles.inlineRow}>
            <Text style={styles.inlineLabel}>{t('profile.theme')}</Text>
            <SegmentedControl<'dark' | 'light'>
              compact
              value={isDark ? 'dark' : 'light'}
              onChange={setThemeMode}
              options={[
                { value: 'dark', label: t('settings.theme_dark') },
                { value: 'light', label: t('settings.theme_light') },
              ]}
            />
          </View>
        </SettingsGroup>

        <SettingsGroup>
          <NavRow
            icon="target"
            label={t('profile.weekly_goal_row')}
            value={t('profile.weekly_goal_value', { count: settings.weeklyGoal })}
            onPress={() => navigation.navigate('WeeklyGoal')}
          />
          <NavRow
            icon="compass"
            label={t('profile.training_goal_row')}
            value={`${t(goalLabelKey(settings.goal))} · ${t(levelLabelKey(settings.level))}`}
            onPress={() => navigation.navigate('OnboardingGoal', { fromSettings: true })}
          />
          <ToggleRow
            icon="bell"
            label={t('profile.reminder_row')}
            value={settings.reminderEnabled}
            onChange={(reminderEnabled) => updateSettings({ reminderEnabled })}
          />
        </SettingsGroup>

        <SettingsGroup>
          <NavRow
            icon="edit-3"
            label={t('profile.menu_edit_profile')}
            onPress={() => navigation.navigate('EditProfile')}
          />
          <NavRow
            icon="sliders"
            label={t('profile.menu_settings')}
            onPress={() => navigation.navigate('Settings')}
          />
          <NavRow
            icon="award"
            label={t('achievements.title')}
            onPress={() => navigation.navigate('Achievements')}
          />
        </SettingsGroup>

        <DangerButton
          label={t('logout')}
          icon="log-out"
          onPress={() => setLogoutOpen(true)}
        />
      </ScrollView>

      <ConfirmDialog
        isOpen={isLogoutOpen}
        title={t('profile.logout_confirm_title')}
        message={t('profile.logout_confirm_desc')}
        confirmText={t('logout')}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    identity: { alignItems: 'center', paddingVertical: 12, marginBottom: 20 },
    avatar: {
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 2,
      borderColor: colors.electric,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    avatarText: { fontSize: 24, fontWeight: '900', color: colors.electric },
    name: { fontSize: 19, fontWeight: '900', color: colors.onSurface },
    email: { fontSize: 12, color: colors.mutedGray, marginTop: 4 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    inlineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    inlineLabel: { fontSize: 13, fontWeight: '800', color: colors.onSurface },
  });
