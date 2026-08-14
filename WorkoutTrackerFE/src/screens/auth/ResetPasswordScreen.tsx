import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../../navigation/types';
import { authApi } from '../../api/auth';
import { useToast } from '../../../components/Toast';
import { PasswordField, PrimaryButton } from '../../../components/ui';
import { AuthLayout, AuthError } from './components/AuthLayout';
import { passwordStrength, isPasswordValid } from '../../utils/password';

type ResetNav = NativeStackNavigationProp<AuthStackParamList>;
type ResetRoute = RouteProp<AuthStackParamList, 'ResetPassword'>;

/** Final step of the 01c → 01d → reset flow. */
export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<ResetNav>();
  const route = useRoute<ResetRoute>();
  const { success } = useToast();
  const resetToken = route.params?.resetToken;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = passwordStrength(password);
  const strengthLabel =
    strength >= 3
      ? t('register.strength_strong')
      : strength === 2
        ? t('register.strength_medium')
        : t('register.strength_weak');

  const submit = async () => {
    if (!password || !confirm) {
      setError(t('reset_password.fill_all'));
      return;
    }
    if (!isPasswordValid(password)) {
      setError(t('register.password_rule'));
      return;
    }
    if (password !== confirm) {
      setError(t('reset_password.mismatch'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authApi.resetPassword(resetToken, password);
      success(t('profile.password_success'));
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (e: any) {
      const message = e?.response?.data?.message;
      setError(
        message === 'TokenExpired'
          ? t('reset_password.token_expired')
          : message === 'TokenInvalid'
            ? t('reset_password.token_invalid')
            : t('reset_password.failed')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon="shield"
      title={t('reset_password.title')}
      subtitle={t('reset_password.subtitle')}
    >
      <AuthError message={error} />

      <PasswordField
        label={t('reset_password.new_password')}
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        strength={strength}
        strengthLabel={password ? strengthLabel : undefined}
      />
      <PasswordField
        label={t('reset_password.confirm_password')}
        value={confirm}
        onChangeText={setConfirm}
        placeholder="••••••••"
        hint={confirm && confirm !== password ? t('reset_password.mismatch') : undefined}
        hintTone="error"
      />

      <PrimaryButton label={t('reset_password.submit')} onPress={submit} loading={isLoading} />
    </AuthLayout>
  );
}
