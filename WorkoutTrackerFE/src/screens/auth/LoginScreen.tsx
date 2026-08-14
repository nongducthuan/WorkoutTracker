import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AuthStackParamList, RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { authApi } from '../../api/auth';
import { FormField, PasswordField, PrimaryButton } from '../../../components/ui';
import { AuthLayout, AuthError, AuthFooterLink } from './components/AuthLayout';

type LoginNav = NativeStackNavigationProp<AuthStackParamList & RootStackParamList>;

/** Design 01 · Đăng nhập. */
export default function LoginScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<LoginNav>();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!identifier || !password) {
      setError(t('register.fill_all'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.login(identifier.trim(), password);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e: any) {
      setError(e?.response?.data?.message || t('login.login_failed'));
    } finally {
      setLoading(false);
    }
  };

  const styles = makeStyles(colors);

  return (
    // Design 01 shows the wordmark and tagline only — no separate heading.
    <AuthLayout showLogo subtitle={t('login.subtitle')}>
      <AuthError message={error} />

      <FormField
        label={t('login.email_label')}
        value={identifier}
        onChangeText={setIdentifier}
        placeholder={t('login.email_hint')}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <PasswordField
        label={t('login.password_label')}
        value={password}
        onChangeText={setPassword}
        placeholder={t('login.password_hint')}
      />

      <TouchableOpacity
        style={styles.forgot}
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        <Text style={styles.forgotText}>{t('login.forgot_password')}</Text>
      </TouchableOpacity>

      <PrimaryButton label={t('login.submit')} onPress={submit} loading={isLoading} />

      <AuthFooterLink
        label={t('login.no_account')}
        action={t('login.sign_up')}
        onPress={() => navigation.navigate('Register')}
      />
    </AuthLayout>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    forgot: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -4 },
    forgotText: { color: colors.electric, fontSize: 12, fontWeight: '800' },
  });
