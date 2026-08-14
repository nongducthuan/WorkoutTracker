import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../../navigation/types';
import { authApi } from '../../api/auth';
import { FormField, PrimaryButton } from '../../../components/ui';
import { AuthLayout, AuthError, AuthFooterLink } from './components/AuthLayout';
import { isEmailValid } from '../../utils/password';

type ForgotNav = NativeStackNavigationProp<AuthStackParamList>;

/** Design 01c · Quên mật khẩu. */
export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<ForgotNav>();

  const [email, setEmail] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!isEmailValid(email)) {
      setError(t('forgot_password.enter_email_error'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.forgotPassword(email.trim());
      navigation.navigate('OtpVerify', { email: email.trim() });
    } catch (e: any) {
      setError(
        e?.response?.data?.message === 'EmailNotExist'
          ? t('forgot_password.email_not_registered')
          : t('forgot_password.send_failed')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon="lock"
      title={t('forgot_password.title')}
      subtitle={t('forgot_password.subtitle')}
    >
      <AuthError message={error} />

      <FormField
        label={t('forgot_password.email_label')}
        value={email}
        onChangeText={setEmail}
        placeholder={t('login.email_hint')}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <PrimaryButton
        label={t('forgot_password.send_code')}
        onPress={submit}
        loading={isLoading}
      />

      <AuthFooterLink
        label={t('forgot_password.remember')}
        action={t('register.log_in')}
        onPress={() => navigation.navigate('Login')}
      />
    </AuthLayout>
  );
}
