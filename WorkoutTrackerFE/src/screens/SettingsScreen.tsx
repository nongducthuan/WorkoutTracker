import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';

type SettingsNav = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<SettingsNav>();
  const { isDark, toggleTheme, colors } = useTheme();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(nextLang);
    AsyncStorage.setItem('language', nextLang);
  };

  const styles = makeStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Feather name="chevron-left" size={20} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.settings_title')}</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={styles.group}>
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Feather name="globe" size={18} color={colors.mutedGray} />
              <Text style={styles.settingItemText}>{t('settings.language')}</Text>
            </View>
            <TouchableOpacity onPress={toggleLanguage} style={styles.settingActionBtn}>
              <Text style={styles.settingActionText}>{i18n.language === 'en' ? 'English' : 'Tiếng Việt'}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.settingItem, styles.settingItemLast]}>
            <View style={styles.settingItemLeft}>
              <Feather name={isDark ? 'moon' : 'sun'} size={18} color={colors.mutedGray} />
              <Text style={styles.settingItemText}>{t('settings.theme')}</Text>
            </View>
            <TouchableOpacity onPress={toggleTheme} style={styles.settingActionBtn}>
              <Text style={styles.settingActionText}>
                {isDark ? t('settings.theme_dark') : t('settings.theme_light')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.group}>
          <TouchableOpacity
            style={[styles.settingItem, styles.settingItemLast]}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <View style={styles.settingItemLeft}>
              <Feather name="lock" size={18} color={colors.mutedGray} />
              <Text style={styles.settingItemText}>{t('profile.change_password_title')}</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedGray} />
          </TouchableOpacity>
        </View>

        <View style={styles.group}>
          <TouchableOpacity
            style={[styles.settingItem, styles.settingItemLast]}
            onPress={() => navigation.navigate('About')}
          >
            <View style={styles.settingItemLeft}>
              <Feather name="info" size={18} color={colors.mutedGray} />
              <Text style={styles.settingItemText}>{t('about.title')}</Text>
            </View>
            <Text style={styles.versionInline}>2.1.0</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) =>
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
      borderColor: colors.border,
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
    group: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      marginBottom: 16,
      overflow: 'hidden',
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingItemLast: {
      borderBottomWidth: 0,
    },
    settingItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    settingItemText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.onSurface,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    settingActionBtn: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    settingActionText: {
      color: colors.electric,
      fontSize: 12,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    versionInline: {
      fontSize: 12,
      color: colors.mutedGray,
    },
  });