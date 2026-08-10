import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';

type SettingsNav = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<SettingsNav>();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(nextLang);
    AsyncStorage.setItem('language', nextLang);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Feather name="chevron-left" size={20} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.settings_title', 'CÀI ĐẶT')}</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={styles.group}>
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Feather name="globe" size={18} color={Colors.mutedGray} />
              <Text style={styles.settingItemText}>{t('settings.language', 'Ngôn ngữ')}</Text>
            </View>
            <TouchableOpacity onPress={toggleLanguage} style={styles.settingActionBtn}>
              <Text style={styles.settingActionText}>{i18n.language === 'en' ? 'English' : 'Tiếng Việt'}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.settingItem, styles.settingItemLast]}>
            <View style={styles.settingItemLeft}>
              <Feather name="moon" size={18} color={Colors.mutedGray} />
              <Text style={styles.settingItemText}>{t('settings.theme', 'Giao diện')}</Text>
            </View>
            <View style={[styles.settingActionBtn, styles.settingActionBtnDisabled]}>
              <Text style={styles.settingActionTextDisabled}>{t('settings.dark_mode_fixed', 'Dark Mode (Fixed)')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.group}>
          <TouchableOpacity
            style={[styles.settingItem, styles.settingItemLast]}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <View style={styles.settingItemLeft}>
              <Feather name="lock" size={18} color={Colors.mutedGray} />
              <Text style={styles.settingItemText}>{t('profile.change_password_title', 'Đổi mật khẩu')}</Text>
            </View>
            <Feather name="chevron-right" size={18} color={Colors.mutedGray} />
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>{t('settings.version', 'Phiên bản')} 2.1.0</Text>
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
  group: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderGray,
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
    borderBottomColor: Colors.borderGray,
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
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingActionBtn: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  settingActionBtnDisabled: {
    opacity: 0.5,
  },
  settingActionText: {
    color: Colors.electric,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  settingActionTextDisabled: {
    color: Colors.mutedGray,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  versionText: {
    textAlign: 'center',
    color: Colors.mutedGray,
    fontSize: 12,
    marginTop: 8,
  },
});