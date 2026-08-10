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
import { Colors } from '../theme/colors';
import { globalStyles } from '../theme/styles';

type ProfileNav = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
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
      t('profile.logout_confirm_title', 'Log out'),
      t('profile.logout_confirm_desc', 'Are you sure you want to log out?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('auth.logout', 'Log out'),
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
      label: t('profile.menu_edit_profile', 'Chỉnh sửa hồ sơ'),
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: 'target',
      label: t('profile.menu_weekly_goal', 'Mục tiêu tuần'),
      onPress: () => navigation.navigate('WeeklyGoal'),
    },
    {
      icon: 'sliders',
      label: t('profile.menu_settings', 'Cài đặt'),
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return (
    <SafeAreaView style={globalStyles.screen} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.glow} pointerEvents="none" />

        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Feather name="chevron-left" size={20} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.title', 'HỒ SƠ')}</Text>
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
            <Text style={styles.statLabel}>{t('profile.stat_workouts', 'Giáo án')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{schedules.length}</Text>
            <Text style={styles.statLabel}>{t('profile.stat_schedules', 'Buổi đã lên lịch')}</Text>
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
                <Feather name={item.icon as any} size={18} color={Colors.mutedGray} />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={Colors.mutedGray} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Feather name="log-out" size={16} color={Colors.electricOrange} />
          <Text style={styles.logoutButtonText}>{t('auth.logout', 'Đăng xuất')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: Colors.electric,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    color: Colors.electric,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  userHandle: {
    fontSize: 12,
    color: Colors.mutedGray,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.electric,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.mutedGray,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  menuGroup: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderGray,
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
    borderBottomColor: Colors.borderGray,
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
    color: Colors.onSurface,
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
    color: Colors.electricOrange,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 14,
  },
});