import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { authApi } from '../src/api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    router.replace('/(auth)/login');
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(nextLang);
    AsyncStorage.setItem('language', nextLang);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {/* Background glow */}
        <View className="absolute -top-10 -left-10 w-64 h-64 bg-electric/5 rounded-full" style={{ opacity: 0.5 }} />

        {/* Header */}
        <View className="border-b border-border-gray pb-4 mb-6 mt-4">
          <Text className="text-3xl font-black tracking-wider text-on-surface uppercase">
            {t('profile.title', 'USER SETTINGS')}
          </Text>
          <Text className="text-muted-gray text-xs tracking-wider uppercase font-bold mt-1">
            {t('profile.subtitle', 'Manage your profile and security')}
          </Text>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row gap-2 mb-6">
          <TouchableOpacity
            onPress={() => setActiveTab('profile')}
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border ${
              activeTab === 'profile'
                ? 'bg-electric border-transparent'
                : 'bg-card border-border-gray'
            }`}
          >
            <Feather name="user" size={16} color={activeTab === 'profile' ? 'black' : 'var(--muted-gray)'} />
            <Text className={`text-xs font-black uppercase tracking-wider ${activeTab === 'profile' ? 'text-black' : 'text-muted-gray'}`}>
              {t('profile.tab_personal', 'Profile')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('password')}
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border ${
              activeTab === 'password'
                ? 'bg-electric border-transparent'
                : 'bg-card border-border-gray'
            }`}
          >
            <Feather name="shield" size={16} color={activeTab === 'password' ? 'black' : 'var(--muted-gray)'} />
            <Text className={`text-xs font-black uppercase tracking-wider ${activeTab === 'password' ? 'text-black' : 'text-muted-gray'}`}>
              {t('profile.tab_password', 'Security')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('settings')}
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border ${
              activeTab === 'settings'
                ? 'bg-electric border-transparent'
                : 'bg-card border-border-gray'
            }`}
          >
            <Feather name="settings" size={16} color={activeTab === 'settings' ? 'black' : 'var(--muted-gray)'} />
            <Text className={`text-[10px] font-black uppercase tracking-wider ${activeTab === 'settings' ? 'text-black' : 'text-muted-gray'}`}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <View className="bg-card border border-border-gray rounded-2xl p-5 mb-8">
          
          {activeTab === 'profile' && (
            <View className="space-y-6">
              <View className="flex-row items-center gap-4 border-b border-border-gray pb-4">
                <View className="w-14 h-14 rounded-full border-2 border-electric bg-surface items-center justify-center">
                  <Text className="text-xl font-bold tracking-widest text-electric uppercase">
                    {currentUser?.name ? currentUser.name.substring(0, 2) : 'US'}
                  </Text>
                </View>
                <View>
                  <Text className="text-lg font-bold text-on-surface uppercase tracking-wider">
                    {currentUser?.name}
                  </Text>
                  <Text className="text-xs text-muted-gray">
                    @{currentUser?.username || 'athlete'}
                  </Text>
                </View>
              </View>

              <View className="space-y-4">
                <View>
                  <Text className="text-[10px] font-black text-muted-gray uppercase tracking-widest mb-1.5">
                    {t('profile.full_name', 'Full Name')}
                  </Text>
                  <Controller
                    control={controlProfile}
                    name="fullName"
                    render={({ field: { onChange, value } }) => (
                      <View className={`flex-row items-center bg-surface border rounded-xl px-4 ${errorsProfile.fullName ? 'border-electric-orange' : 'border-border-gray'}`}>
                        <Feather name="user" size={16} color="var(--muted-gray)" className="mr-2" />
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          className="flex-1 py-3 text-sm text-white h-[48px]"
                          placeholderTextColor="var(--muted-gray)"
                        />
                      </View>
                    )}
                  />
                  {errorsProfile.fullName && (
                    <Text className="text-electric-orange text-xs mt-1 font-bold">{errorsProfile.fullName.message}</Text>
                  )}
                </View>

                <View>
                  <View className="flex-row justify-between items-center mb-1.5">
                    <Text className="text-[10px] font-black text-muted-gray uppercase tracking-widest">
                      {t('profile.email', 'Email Address')}
                    </Text>
                    <Text className="text-[10px] font-bold text-muted-gray/50 uppercase">
                      Cannot be changed
                    </Text>
                  </View>
                  <View className="flex-row items-center bg-surface/50 border border-border-gray/50 rounded-xl px-4 opacity-70">
                    <Feather name="mail" size={16} color="var(--muted-gray)" className="mr-2" />
                    <TextInput
                      value={currentUser?.email || ''}
                      editable={false}
                      className="flex-1 py-3 text-sm text-muted-gray h-[48px]"
                    />
                    <Feather name="lock" size={14} color="var(--muted-gray)" />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSubmitProfile(onSubmitProfile)}
                  disabled={isSubmittingProfile}
                  className={`flex-row items-center justify-center gap-2 py-3.5 mt-2 rounded-xl ${isSubmittingProfile ? 'bg-electric/50' : 'bg-electric'}`}
                >
                  <Feather name="save" size={16} color="black" />
                  <Text className="text-black font-black uppercase tracking-wider text-sm">
                    {isSubmittingProfile ? t('profile.saving', 'Saving...') : t('profile.save_changes', 'Save Changes')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'password' && (
            <View className="space-y-6">
              <View className="flex-row items-center gap-2 border-b border-border-gray pb-4">
                <Feather name="shield" size={18} color="var(--electric)" />
                <Text className="text-lg font-bold text-on-surface uppercase tracking-wider">
                  {t('profile.security_settings', 'Password Management')}
                </Text>
              </View>

              <View className="space-y-4">
                <View>
                  <Text className="text-[10px] font-black text-muted-gray uppercase tracking-widest mb-1.5">
                    {t('profile.current_password', 'Current Password')}
                  </Text>
                  <Controller
                    control={controlPassword}
                    name="oldPassword"
                    render={({ field: { onChange, value } }) => (
                      <View className={`flex-row items-center bg-surface border rounded-xl px-4 ${errorsPassword.oldPassword ? 'border-electric-orange' : 'border-border-gray'}`}>
                        <Feather name="lock" size={16} color="var(--muted-gray)" className="mr-2" />
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          secureTextEntry={!showOld}
                          className="flex-1 py-3 text-sm text-white h-[48px]"
                          placeholderTextColor="var(--muted-gray)"
                          placeholder="••••••••"
                        />
                        <TouchableOpacity onPress={() => setShowOld(!showOld)} className="p-1">
                          <Feather name={showOld ? 'eye-off' : 'eye'} size={16} color="var(--muted-gray)" />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  {errorsPassword.oldPassword && (
                    <Text className="text-electric-orange text-xs mt-1 font-bold">{errorsPassword.oldPassword.message}</Text>
                  )}
                </View>

                <View>
                  <Text className="text-[10px] font-black text-muted-gray uppercase tracking-widest mb-1.5">
                    {t('profile.new_password', 'New Password')}
                  </Text>
                  <Controller
                    control={controlPassword}
                    name="newPassword"
                    render={({ field: { onChange, value } }) => (
                      <View className={`flex-row items-center bg-surface border rounded-xl px-4 ${errorsPassword.newPassword ? 'border-electric-orange' : 'border-border-gray'}`}>
                        <Feather name="lock" size={16} color="var(--muted-gray)" className="mr-2" />
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          secureTextEntry={!showNew}
                          className="flex-1 py-3 text-sm text-white h-[48px]"
                          placeholderTextColor="var(--muted-gray)"
                          placeholder="•••••••• (Min 6)"
                        />
                        <TouchableOpacity onPress={() => setShowNew(!showNew)} className="p-1">
                          <Feather name={showNew ? 'eye-off' : 'eye'} size={16} color="var(--muted-gray)" />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  {errorsPassword.newPassword && (
                    <Text className="text-electric-orange text-xs mt-1 font-bold">{errorsPassword.newPassword.message}</Text>
                  )}
                </View>

                <View>
                  <Text className="text-[10px] font-black text-muted-gray uppercase tracking-widest mb-1.5">
                    {t('profile.confirm_new_password', 'Confirm Password')}
                  </Text>
                  <Controller
                    control={controlPassword}
                    name="confirmPassword"
                    render={({ field: { onChange, value } }) => (
                      <View className={`flex-row items-center bg-surface border rounded-xl px-4 ${errorsPassword.confirmPassword ? 'border-electric-orange' : 'border-border-gray'}`}>
                        <Feather name="lock" size={16} color="var(--muted-gray)" className="mr-2" />
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          secureTextEntry={!showConfirm}
                          className="flex-1 py-3 text-sm text-white h-[48px]"
                          placeholderTextColor="var(--muted-gray)"
                          placeholder="••••••••"
                        />
                        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} className="p-1">
                          <Feather name={showConfirm ? 'eye-off' : 'eye'} size={16} color="var(--muted-gray)" />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  {errorsPassword.confirmPassword && (
                    <Text className="text-electric-orange text-xs mt-1 font-bold">{errorsPassword.confirmPassword.message}</Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={handleSubmitPassword(onSubmitPassword)}
                  disabled={isSubmittingPassword}
                  className={`flex-row items-center justify-center gap-2 py-3.5 mt-2 rounded-xl ${isSubmittingPassword ? 'bg-electric/50' : 'bg-electric'}`}
                >
                  <Feather name="check-circle" size={16} color="black" />
                  <Text className="text-black font-black uppercase tracking-wider text-sm">
                    {isSubmittingPassword ? t('profile.updating', 'Updating...') : t('profile.update_password', 'Update Password')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'settings' && (
            <View className="space-y-6">
              <View className="flex-row items-center gap-2 border-b border-border-gray pb-4">
                <Feather name="sliders" size={18} color="var(--electric)" />
                <Text className="text-lg font-bold text-on-surface uppercase tracking-wider">
                  App Settings
                </Text>
              </View>

              <View className="space-y-4">
                <View className="flex-row justify-between items-center bg-surface border border-border-gray p-4 rounded-xl">
                  <View className="flex-row items-center gap-3">
                    <Feather name="globe" size={18} color="var(--muted-gray)" />
                    <Text className="text-sm font-bold text-white uppercase tracking-wider">Language</Text>
                  </View>
                  <TouchableOpacity onPress={toggleLanguage} className="bg-background border border-border-gray px-3 py-1.5 rounded-lg">
                    <Text className="text-electric text-xs font-black uppercase">{i18n.language === 'en' ? 'English' : 'Tiếng Việt'}</Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row justify-between items-center bg-surface border border-border-gray p-4 rounded-xl">
                  <View className="flex-row items-center gap-3">
                    <Feather name="moon" size={18} color="var(--muted-gray)" />
                    <Text className="text-sm font-bold text-white uppercase tracking-wider">Theme</Text>
                  </View>
                  <View className="bg-background border border-border-gray px-3 py-1.5 rounded-lg opacity-50">
                    <Text className="text-muted-gray text-xs font-black uppercase">Dark Mode (Fixed)</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={handleLogout}
                  className="mt-4 flex-row items-center justify-center gap-2 py-3.5 rounded-xl border border-electric-orange/50 bg-electric-orange/10"
                >
                  <Feather name="log-out" size={16} color="var(--electric-orange)" />
                  <Text className="text-electric-orange font-black uppercase tracking-wider text-sm">
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
