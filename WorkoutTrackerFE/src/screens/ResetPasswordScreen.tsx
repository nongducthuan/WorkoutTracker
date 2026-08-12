import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { AuthStackParamList } from '../navigation/types';
import { authApi } from '../api/auth';

type ResetPasswordNav = NativeStackNavigationProp<AuthStackParamList>;
type ResetPasswordRoute = RouteProp<AuthStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<ResetPasswordNav>();
  const route = useRoute<ResetPasswordRoute>();
  const resetToken = route.params?.resetToken || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError(t('reset_password.fill_all'));
      return;
    }
    if (newPassword.length < 6) {
      setError(t('reset_password.min_length'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('reset_password.mismatch'));
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await authApi.resetPassword(resetToken, newPassword);
      // Reset xong, đưa thẳng về Login, xóa hết stack Auth cũ
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    } catch (e: any) {
      const message =
        e?.response?.data?.message === 'ResetTokenExpired'
          ? t('reset_password.token_expired')
          : e?.response?.data?.message === 'ResetTokenInvalid' ||
            e?.response?.data?.message === 'ResetTokenAlreadyUsed'
          ? t('reset_password.token_invalid')
          : t('reset_password.failed');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.screen}
      >
        <View style={styles.inner}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="chevron-left" size={20} color={Colors.onSurface} />
          </TouchableOpacity>

          <View style={styles.lockIconWrap}>
            <Feather name="key" size={28} color={Colors.electric} />
          </View>

          <Text style={styles.title}>{t('reset_password.title')}</Text>
          <Text style={styles.subtitle}>
            {t('reset_password.subtitle')}
          </Text>

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.label}>{t('reset_password.new_password')}</Text>
          <View style={styles.inputWrap}>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.mutedGray}
              secureTextEntry={!showPassword}
              style={styles.inputField}
            />
            <TouchableOpacity onPress={() => setShowPassword((s) => !s)} style={styles.eyeBtn}>
              <Feather
                name={showPassword ? 'eye-off' : 'eye'}
                size={18}
                color={Colors.mutedGray}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{t('reset_password.confirm_password')}</Text>
          <View style={styles.inputWrap}>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.mutedGray}
              secureTextEntry={!showPassword}
              style={styles.inputField}
            />
          </View>

          <TouchableOpacity
            onPress={handleReset}
            disabled={isLoading}
            style={[styles.btn, isLoading && { backgroundColor: Colors.electricDim }]}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.black} />
            ) : (
              <Text style={styles.btnText}>{t('reset_password.submit')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  lockIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 22, fontWeight: '900', color: Colors.onSurface, textAlign: 'center', marginBottom: 12, letterSpacing: 1 },
  subtitle: { fontSize: 13, color: Colors.mutedGray, textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#FC8181', textAlign: 'center', fontWeight: '600' },
  label: { color: Colors.mutedGray, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginBottom: 16,
  },
  inputField: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.onSurface,
  },
  eyeBtn: { paddingHorizontal: 14 },
  btn: {
    backgroundColor: Colors.electric,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: Colors.black, fontWeight: '900', fontSize: 16 },
});