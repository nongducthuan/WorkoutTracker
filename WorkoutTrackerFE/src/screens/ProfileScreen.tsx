import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../api/auth';
import { useWorkouts, useSchedules } from '../hooks/useFitnessData';
import { RootStackParamList } from '../navigation/types';
import { globalStyles } from '../theme/styles';
import { useTheme } from '../context/ThemeContext';

type ProfileNav = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<ProfileNav>();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const { workouts } = useWorkouts();
  const { schedules } = useSchedules();

  useEffect(() => {
    authApi.getCurrentUser().then(setCurrentUser);
  }, []);

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout_confirm_title'),
      t('profile.logout_confirm_desc'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            await authApi.logout();
            navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Auth' }] } as any);
          },
        },
      ]
    );
  };

  const menuItems: {
    icon: string;
    label: string;
    onPress: () => void;
  }[] = [
    {
      icon: 'edit-3',
      label: t('profile.menu_edit_profile'),
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: 'target',
      label: t('profile.menu_weekly_goal'),
      onPress: () => navigation.navigate('WeeklyGoal'),
    },
    {
      icon: 'sliders',
      label: t('profile.menu_settings'),
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={globalStyles.screen} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.glow} pointerEvents="none" />

        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Feather name="chevron-left" size={20} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
          <View style={styles.iconButton} />
        </View>

        {/* Avatar + name */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {currentUser?.fullName ? currentUser.fullName.substring(0, 2) : 'US'}
            </Text>
          </View>
          <Text style={styles.userName}>{currentUser?.fullName || '—'}</Text>
          <Text style={styles.userHandle}>@{currentUser?.userName || 'athlete'}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{workouts.length}</Text>
            <Text style={styles.statLabel}>{t('profile.stat_workouts')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{schedules.length}</Text>
            <Text style={styles.statLabel}>{t('profile.stat_schedules')}</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuGroup}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              style={[
                styles.menuItem,
                idx === menuItems.length - 1 && styles.menuItemLast,
              ]}
            >
              <View style={styles.menuItemLeft}>
                <Feather name={item.icon as any} size={18} color={colors.mutedGray} />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedGray} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Feather name="log-out" size={16} color={colors.electricOrange} />
          <Text style={styles.logoutButtonText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  glow: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 256,
    height: 256,
    backgroundColor: 'rgba(204, 255, 0, 0.05)',
    borderRadius: 128,
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
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.electric,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    color: colors.electric,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  userHandle: {
    fontSize: 12,
    color: colors.mutedGray,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.electric,
  },
  statLabel: {
    fontSize: 11,
    color: colors.mutedGray,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  menuGroup: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 0, 0.5)',
    backgroundColor: 'rgba(255, 77, 0, 0.1)',
  },
  logoutButtonText: {
    color: colors.electricOrange,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 14,
  },
});