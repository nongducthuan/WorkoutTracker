import React, { useEffect, useState } from 'react';
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

const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name can't be empty")
    .max(100, 'Full name must be under 100 characters'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type EditProfileNav = NativeStackNavigationProp<RootStackParamList>;

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<EditProfileNav>();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '' },
  });

  useEffect(() => {
    authApi.getCurrentUser().then((user) => {
      setCurrentUser(user);
      reset({ fullName: user?.fullName || '' });
    });
  }, []);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await authApi.updateProfile(data.fullName, currentUser?.email || '');
      const updated = await authApi.getCurrentUser();
      setCurrentUser(updated);
      Alert.alert(t('profile.update_success', 'Profile updated successfully!'));
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(err.message || t('profile.update_failed', 'Failed to update profile'));
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
            <Text style={styles.headerTitle}>
              {t('profile.edit_title')}
            </Text>
            <View style={styles.iconButton} />
          </View>

          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {currentUser?.fullName ? currentUser.fullName.substring(0, 2) : 'US'}
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>{t('profile.full_name')}</Text>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.inputContainer, errors.fullName ? styles.inputError : null]}>
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
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName.message}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.emailLabelRow}>
                <Text style={styles.inputLabel}>{t('profile.email')}</Text>
                <Text style={styles.emailDisabledLabel}>{t('profile.cannot_change')}</Text>
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
          </View>

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            style={[styles.saveButton, isSubmitting ? styles.saveButtonDisabled : null]}
          >
            <Feather name="save" size={16} color="#000000" />
            <Text style={styles.saveButtonText}>
              {isSubmitting ? t('profile.saving') : t('profile.save_changes')}
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
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: Colors.electric,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    color: Colors.electric,
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
  errorText: {
    color: Colors.electricOrange,
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
  },
  emailLabelRow: {
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