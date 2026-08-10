import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../api/auth';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;
type ChangePasswordNav = NativeStackNavigationProp<RootStackParamList>;

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<ChangePasswordNav>();

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: PasswordFormValues) => {
    try {
      await authApi.changePassword(data.oldPassword, data.newPassword);
      Alert.alert(t('profile.password_success', 'Password changed successfully!'));
      reset();
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(err.message || t('profile.password_failed', 'Failed to change password'));
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.screen}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <Feather name="chevron-left" size={20} color={Colors.onSurface} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('profile.change_password_title', 'ĐỔI MẬT KHẨU')}</Text>
            <View style={styles.iconButton} />
          </View>

          <View style={styles.formCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>{t('profile.current_password', 'Mật khẩu hiện tại')}</Text>
              <Controller
                control={control}
                name="oldPassword"
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.inputContainer, errors.oldPassword ? styles.inputError : null]}>
                    <Feather name="lock" size={16} color={Colors.mutedGray} style={styles.inputIcon} />
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry={!showOld}
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor={Colors.mutedGray}
                    />
                    <TouchableOpacity onPress={() => setShowOld(!showOld)} style={styles.eyeButton}>
                      <Feather name={showOld ? 'eye-off' : 'eye'} size={16} color={Colors.mutedGray} />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.oldPassword && <Text style={styles.errorText}>{errors.oldPassword.message}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>{t('profile.new_password', 'Mật khẩu mới')}</Text>
              <Controller
                control={control}
                name="newPassword"
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.inputContainer, errors.newPassword ? styles.inputError : null]}>
                    <Feather name="lock" size={16} color={Colors.mutedGray} style={styles.inputIcon} />
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry={!showNew}
                      style={styles.input}
                      placeholder="•••••••• (Min 6)"
                      placeholderTextColor={Colors.mutedGray}
                    />
                    <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeButton}>
                      <Feather name={showNew ? 'eye-off' : 'eye'} size={16} color={Colors.mutedGray} />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword.message}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>{t('profile.confirm_new_password', 'Nhập lại mật khẩu mới')}</Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.inputContainer, errors.confirmPassword ? styles.inputError : null]}>
                    <Feather name="lock" size={16} color={Colors.mutedGray} style={styles.inputIcon} />
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry={!showConfirm}
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor={Colors.mutedGray}
                    />
                    <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeButton}>
                      <Feather name={showConfirm ? 'eye-off' : 'eye'} size={16} color={Colors.mutedGray} />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            style={[styles.saveButton, isSubmitting ? styles.saveButtonDisabled : null]}
          >
            <Feather name="check-circle" size={16} color="#000000" />
            <Text style={styles.saveButtonText}>
              {isSubmitting ? t('profile.updating', 'Updating...') : t('profile.update_password', 'Cập nhật mật khẩu')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  formCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    marginBottom: 24,
  },
  fieldGroup: {
    gap: 0,
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
  eyeButton: {
    padding: 4,
  },
  errorText: {
    color: Colors.electricOrange,
    fontSize: 12,
    marginTop: 4,
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