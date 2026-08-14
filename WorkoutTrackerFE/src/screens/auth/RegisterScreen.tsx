import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AuthStackParamList, RootStackParamList } from '../../navigation/types';
import { authApi } from '../../api/auth';
import { FormField, PasswordField, PrimaryButton } from '../../../components/ui';
import { AuthLayout, AuthError, AuthFooterLink } from './components/AuthLayout';
import { isEmailValid, passwordStrength, isPasswordValid } from '../../utils/password';

type RegisterNav = NativeStackNavigationProp<AuthStackParamList & RootStackParamList>;

/** Design 01b · Đăng ký, with live email + password-strength feedback. */
export default function RegisterScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<RegisterNav>();

  const [fullName, setFullName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emailTouched = email.length > 0;
  const emailOk = isEmailValid(email);
  const strength = passwordStrength(password);
  const strengthLabel =
    strength >= 3
      ? t('register.strength_strong')
      : strength === 2
        ? t('register.strength_medium')
        : t('register.strength_weak');

  const submit = async () => {
    if (!fullName || !userName || !email || !password) {
      setError(t('register.fill_all'));
      return;
    }
    if (!emailOk) {
      setError(t('register.email_invalid'));
      return;
    }
    if (!isPasswordValid(password)) {
      setError(t('register.password_rule'));
      return;
    }
    if (password !== confirm) {
      setError(t('register.password_mismatch'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authApi.register(fullName.trim(), userName.trim(), email.trim(), password);
      // New accounts land on onboarding (design 01e) before the dashboard.
      navigation.reset({ index: 0, routes: [{ name: 'OnboardingGoal' }] });
    } catch (e: any) {
      setError(e?.response?.data?.message || t('register.register_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      showLogo
      title={t('register.title_screen')}
      subtitle={t('register.desc', 'Tạo tài khoản để bắt đầu hành trình của bạn')}
    >
      <AuthError message={error} />

      <FormField
        label={t('register.name_label')}
        value={fullName}
        onChangeText={setFullName}
        placeholder={t('register.name_placeholder')}
      />
      <FormField
        label={t('register.username_label')}
        value={userName}
        onChangeText={setUserName}
        placeholder={t('register.username_placeholder')}
        autoCapitalize="none"
      />
      <FormField
        label={t('login.email_label')}
        value={email}
        onChangeText={setEmail}
        placeholder={t('login.email_hint')}
        autoCapitalize="none"
        keyboardType="email-address"
        hint={
          emailTouched
            ? emailOk
              ? t('register.email_valid')
              : t('register.email_invalid')
            : undefined
        }
        hintTone={emailTouched ? (emailOk ? 'ok' : 'error') : 'muted'}
      />
      <PasswordField
        label={t('login.password_label')}
        value={password}
        onChangeText={setPassword}
        placeholder={t('login.password_hint')}
        strength={strength}
        strengthLabel={password ? strengthLabel : undefined}
      />
      <PasswordField
        label={t('register.confirm_password_label')}
        value={confirm}
        onChangeText={setConfirm}
        placeholder={t('register.confirm_password_hint')}
        hint={confirm && confirm !== password ? t('register.password_mismatch') : undefined}
        hintTone="error"
      />

      <PrimaryButton label={t('register.sign_up')} onPress={submit} loading={isLoading} />

      <AuthFooterLink
        label={t('register.already_account')}
        action={t('register.log_in')}
        onPress={() => navigation.navigate('Login')}
      />
    </AuthLayout>
  );
}
