import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { useSettings } from '../../context/SettingsContext';
import { AppLanguage } from '../../i18n';
import { ScreenHeader } from '../../../components/ScreenHeader';
import {
  SettingsGroup,
  NavRow,
  ToggleRow,
  SegmentedControl,
  SectionLabel,
} from '../../../components/ui';
import { WeightUnit } from '../../utils/format';

type SettingsNav = NativeStackNavigationProp<RootStackParamList>;

const APP_VERSION = '2.1.0';

/** Design 08d · Cài đặt chung. */
export default function SettingsScreen() {
  const { colors, isDark, setThemeMode } = useTheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<SettingsNav>();
  const { settings, updateSettings, setLanguage } = useSettings();

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title={t('profile.settings_title')} />

        <SectionLabel>{t('settings.group_display')}</SectionLabel>
        <SettingsGroup>
          <View style={styles.inlineRow}>
            <Text style={styles.inlineLabel}>{t('settings.weight_unit')}</Text>
            <SegmentedControl<WeightUnit>
              compact
              value={settings.weightUnit}
              onChange={(weightUnit) => updateSettings({ weightUnit })}
              options={[
                { value: 'kg', label: 'kg' },
                { value: 'lb', label: 'lb' },
              ]}
            />
          </View>
          <View style={styles.inlineRow}>
            <Text style={styles.inlineLabel}>{t('settings.language')}</Text>
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
            <Text style={styles.inlineLabel}>{t('settings.theme')}</Text>
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

        <SectionLabel>{t('settings.group_in_workout')}</SectionLabel>
        <SettingsGroup>
          <ToggleRow
            icon="volume-2"
            label={t('settings.rest_sound')}
            value={settings.restSoundEnabled}
            onChange={(restSoundEnabled) => updateSettings({ restSoundEnabled })}
          />
          <ToggleRow
            icon="smartphone"
            label={t('settings.vibrate')}
            value={settings.vibrationEnabled}
            onChange={(vibrationEnabled) => updateSettings({ vibrationEnabled })}
          />
          <ToggleRow
            icon="sun"
            label={t('settings.keep_awake')}
            value={settings.keepAwake}
            onChange={(keepAwake) => updateSettings({ keepAwake })}
          />
        </SettingsGroup>

        <SectionLabel>{t('settings.group_account')}</SectionLabel>
        <SettingsGroup>
          <NavRow
            icon="lock"
            label={t('profile.change_password_title')}
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <NavRow
            icon="info"
            label={t('about.title')}
            value={`${t('settings.version_label')} ${APP_VERSION}`}
            onPress={() => navigation.navigate('About')}
          />
        </SettingsGroup>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
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
