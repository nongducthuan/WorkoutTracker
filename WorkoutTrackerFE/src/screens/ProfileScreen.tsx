import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  StyleSheet
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import { globalStyles } from '../theme/styles';

const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name can't be empty")
    .max(100, 'Full name must be under 100 characters'),
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'settings'>('profile');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    authApi.getCurrentUser().then((user) => {
      setCurrentUser(user);
      resetProfile({ fullName: user?.name || '' });
    });
  }, []);

  const {
    control: controlProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: errorsProfile, isSubmitting: isSubmittingProfile },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '' },
  });

  const onSubmitProfile = async (data: ProfileFormValues) => {
    try {
      await authApi.updateProfile(data.fullName, currentUser?.email || '');
      const updated = await authApi.getCurrentUser();
      setCurrentUser(updated);
      alert(t('profile.update_success', 'Profile updated successfully!'));
    } catch (err: any) {
      alert(err.message || t('profile.update_failed', 'Failed to update profile'));
    }
  };

  const {
    control: controlPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: errorsPassword, isSubmitting: isSubmittingPassword },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmitPassword = async (data: PasswordFormValues) => {
    try {
      await authApi.changePassword(data.oldPassword, data.newPassword);
      alert(t('profile.password_success', 'Password changed successfully!'));
      resetPassword();
    } catch (err: any) {
      alert(err.message || t('profile.password_failed', 'Failed to change password'));
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    navigation.replace('Login');
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(nextLang);
    AsyncStorage.setItem('language', nextLang);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={globalStyles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Background glow */}
        <View style={styles.glow} />

        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>
            {t('profile.title', 'USER SETTINGS')}
          </Text>
          <Text style={styles.headerSubtitle}>
            {t('profile.subtitle', 'Manage your profile and security')}
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('profile')}
            style={[
              styles.tabButton,
              activeTab === 'profile' ? styles.tabButtonActive : styles.tabButtonInactive
            ]}
          >
            <Feather name="user" size={16} color={activeTab === 'profile' ? '#000000' : Colors.mutedGray} />
            <Text style={[
              styles.tabText,
              activeTab === 'profile' ? styles.tabTextActive : styles.tabTextInactive
            ]}>
              {t('profile.tab_personal', 'Profile')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('password')}
            style={[
              styles.tabButton,
              activeTab === 'password' ? styles.tabButtonActive : styles.tabButtonInactive
            ]}
          >
            <Feather name="shield" size={16} color={activeTab === 'password' ? '#000000' : Colors.mutedGray} />
            <Text style={[
              styles.tabText,
              activeTab === 'password' ? styles.tabTextActive : styles.tabTextInactive
            ]}>
              {t('profile.tab_password', 'Security')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('settings')}
            style={[
              styles.tabButton,
              activeTab === 'settings' ? styles.tabButtonActive : styles.tabButtonInactive
            ]}
          >
            <Feather name="settings" size={16} color={activeTab === 'settings' ? '#000000' : Colors.mutedGray} />
            <Text style={[
              styles.tabTextSettings,
              activeTab === 'settings' ? styles.tabTextActive : styles.tabTextInactive
            ]}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <View style={styles.contentCard}>
          
          {activeTab === 'profile' && (
            <View style={styles.spaceY6}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {currentUser?.name ? currentUser.name.substring(0, 2) : 'US'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.userName}>
                    {currentUser?.name}
                  </Text>
                  <Text style={styles.userHandle}>
                    @{currentUser?.username || 'athlete'}
                  </Text>
                </View>
              </View>

              <View style={styles.spaceY4}>
                <View>
                  <Text style={styles.inputLabel}>
                    {t('profile.full_name', 'Full Name')}
                  </Text>
                  <Controller
                    control={controlProfile}
                    name="fullName"
                    render={({ field: { onChange, value } }) => (
                      <View style={[
                        styles.inputContainer,
                        errorsProfile.fullName ? styles.inputError : null
                      ]}>
                        <Feather name="user" size={16} color={Colors.mutedGray} style={styles.inputIcon} />
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          style={styles.input}
                          placeholderTextColor={Colors.mutedGray}
                        />
                      </View>
                    )}
                  />
                  {errorsProfile.fullName && (
                    <Text style={styles.errorText}>{errorsProfile.fullName.message}</Text>
                  )}
                </View>

                <View>
                  <View style={styles.emailLabelContainer}>
                    <Text style={styles.inputLabel}>
                      {t('profile.email', 'Email Address')}
                    </Text>
                    <Text style={styles.emailDisabledLabel}>
                      Cannot be changed
                    </Text>
                  </View>
                  <View style={[styles.inputContainer, styles.inputDisabled]}>
                    <Feather name="mail" size={16} color={Colors.mutedGray} style={styles.inputIcon} />
                    <TextInput
                      value={currentUser?.email || ''}
                      editable={false}
                      style={styles.inputDisabledText}
                    />
                    <Feather name="lock" size={14} color={Colors.mutedGray} />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSubmitProfile(onSubmitProfile)}
                  disabled={isSubmittingProfile}
                  style={[
                    styles.saveButton,
                    isSubmittingProfile ? styles.saveButtonDisabled : null
                  ]}
                >
                  <Feather name="save" size={16} color="#000000" />
                  <Text style={styles.saveButtonText}>
                    {isSubmittingProfile ? t('profile.saving', 'Saving...') : t('profile.save_changes', 'Save Changes')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'password' && (
            <View style={styles.spaceY6}>
              <View style={styles.passwordHeader}>
                <Feather name="shield" size={18} color={Colors.electric} />
                <Text style={styles.passwordTitle}>
                  {t('profile.security_settings', 'Password Management')}
                </Text>
              </View>

              <View style={styles.spaceY4}>
                <View>
                  <Text style={styles.inputLabel}>
                    {t('profile.current_password', 'Current Password')}
                  </Text>
                  <Controller
                    control={controlPassword}
                    name="oldPassword"
                    render={({ field: { onChange, value } }) => (
                      <View style={[
                        styles.inputContainer,
                        errorsPassword.oldPassword ? styles.inputError : null
                      ]}>
                        <Feather name="lock" size={16} color={Colors.mutedGray} style={styles.inputIcon} />
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          secureTextEntry={!showOld}
                          style={styles.input}
                          placeholderTextColor={Colors.mutedGray}
                          placeholder="••••••••"
                        />
                        <TouchableOpacity onPress={() => setShowOld(!showOld)} style={styles.eyeButton}>
                          <Feather name={showOld ? 'eye-off' : 'eye'} size={16} color={Colors.mutedGray} />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  {errorsPassword.oldPassword && (
                    <Text style={styles.errorText}>{errorsPassword.oldPassword.message}</Text>
                  )}
                </View>

                <View>
                  <Text style={styles.inputLabel}>
                    {t('profile.new_password', 'New Password')}
                  </Text>
                  <Controller
                    control={controlPassword}
                    name="newPassword"
                    render={({ field: { onChange, value } }) => (
                      <View style={[
                        styles.inputContainer,
                        errorsPassword.newPassword ? styles.inputError : null
                      ]}>
                        <Feather name="lock" size={16} color={Colors.mutedGray} style={styles.inputIcon} />
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          secureTextEntry={!showNew}
                          style={styles.input}
                          placeholderTextColor={Colors.mutedGray}
                          placeholder="•••••••• (Min 6)"
                        />
                        <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeButton}>
                          <Feather name={showNew ? 'eye-off' : 'eye'} size={16} color={Colors.mutedGray} />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  {errorsPassword.newPassword && (
                    <Text style={styles.errorText}>{errorsPassword.newPassword.message}</Text>
                  )}
                </View>

                <View>
                  <Text style={styles.inputLabel}>
                    {t('profile.confirm_new_password', 'Confirm Password')}
                  </Text>
                  <Controller
                    control={controlPassword}
                    name="confirmPassword"
                    render={({ field: { onChange, value } }) => (
                      <View style={[
                        styles.inputContainer,
                        errorsPassword.confirmPassword ? styles.inputError : null
                      ]}>
                        <Feather name="lock" size={16} color={Colors.mutedGray} style={styles.inputIcon} />
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          secureTextEntry={!showConfirm}
                          style={styles.input}
                          placeholderTextColor={Colors.mutedGray}
                          placeholder="••••••••"
                        />
                        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeButton}>
                          <Feather name={showConfirm ? 'eye-off' : 'eye'} size={16} color={Colors.mutedGray} />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  {errorsPassword.confirmPassword && (
                    <Text style={styles.errorText}>{errorsPassword.confirmPassword.message}</Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={handleSubmitPassword(onSubmitPassword)}
                  disabled={isSubmittingPassword}
                  style={[
                    styles.saveButton,
                    isSubmittingPassword ? styles.saveButtonDisabled : null
                  ]}
                >
                  <Feather name="check-circle" size={16} color="#000000" />
                  <Text style={styles.saveButtonText}>
                    {isSubmittingPassword ? t('profile.updating', 'Updating...') : t('profile.update_password', 'Update Password')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'settings' && (
            <View style={styles.spaceY6}>
              <View style={styles.passwordHeader}>
                <Feather name="sliders" size={18} color={Colors.electric} />
                <Text style={styles.passwordTitle}>
                  App Settings
                </Text>
              </View>

              <View style={styles.spaceY4}>
                <View style={styles.settingItem}>
                  <View style={styles.settingItemLeft}>
                    <Feather name="globe" size={18} color={Colors.mutedGray} />
                    <Text style={styles.settingItemText}>Language</Text>
                  </View>
                  <TouchableOpacity onPress={toggleLanguage} style={styles.settingActionBtn}>
                    <Text style={styles.settingActionText}>{i18n.language === 'en' ? 'English' : 'Tiếng Việt'}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingItemLeft}>
                    <Feather name="moon" size={18} color={Colors.mutedGray} />
                    <Text style={styles.settingItemText}>Theme</Text>
                  </View>
                  <View style={[styles.settingActionBtn, { opacity: 0.5, backgroundColor: Colors.background }]}>
                    <Text style={styles.settingActionTextDisabled}>Dark Mode (Fixed)</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={handleLogout}
                  style={styles.logoutButton}
                >
                  <Feather name="log-out" size={16} color={Colors.electricOrange} />
                  <Text style={styles.logoutButtonText}>
                    {t('auth.logout', 'Log out')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  headerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGray,
    paddingBottom: 16,
    marginBottom: 24,
    marginTop: 16,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: Colors.onSurface,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    color: Colors.mutedGray,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  tabButtonActive: {
    backgroundColor: Colors.electric,
    borderColor: 'transparent',
  },
  tabButtonInactive: {
    backgroundColor: Colors.card,
    borderColor: Colors.borderGray,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  tabTextSettings: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  tabTextActive: {
    color: '#000000',
  },
  tabTextInactive: {
    color: Colors.mutedGray,
  },
  contentCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  spaceY6: {
    gap: 24,
  },
  spaceY4: {
    gap: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGray,
    paddingBottom: 16,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.electric,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
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
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.mutedGray,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: Colors.electricOrange,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#FFFFFF',
    height: 48,
  },
  errorText: {
    color: Colors.electricOrange,
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
  },
  emailLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  emailDisabledLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'rgba(156, 163, 175, 0.5)',
    textTransform: 'uppercase',
  },
  inputDisabled: {
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    borderColor: 'rgba(51, 51, 51, 0.5)',
  },
  inputDisabledText: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.mutedGray,
    height: 48,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 8,
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
  passwordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGray,
    paddingBottom: 16,
  },
  passwordTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  eyeButton: {
    padding: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    padding: 16,
    borderRadius: 12,
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
    letterSpacing: 1.5,
  },
  settingActionBtn: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
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
  logoutButton: {
    marginTop: 16,
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
  }
});
