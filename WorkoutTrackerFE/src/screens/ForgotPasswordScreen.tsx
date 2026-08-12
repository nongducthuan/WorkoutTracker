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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { AuthStackParamList } from '../navigation/types';
import { authApi } from '../api/auth';

type ForgotPasswordNav = NativeStackNavigationProp<AuthStackParamList>;

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<ForgotPasswordNav>();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email.trim()) {
      setError(t('forgot_password.enter_email_error'));
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      navigation.navigate('OtpVerify', { email: email.trim() });
    } catch (e: any) {
      const message =
        e?.response?.data?.message === 'EmailNotExist'
          ? t('forgot_password.email_not_registered')
          : t('forgot_password.send_failed');
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
            <Feather name="lock" size={28} color={Colors.electric} />
          </View>

          <Text style={styles.title}>{t('forgot_password.title')}</Text>
          <Text style={styles.subtitle}>
            {t('forgot_password.subtitle')}
          </Text>

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.label}>{t('forgot_password.email_label')}</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t('login.email_hint')}
            placeholderTextColor={Colors.mutedGray}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={isLoading}
            style={[styles.btn, isLoading && { backgroundColor: Colors.electricDim }]}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.black} />
            ) : (
              <Text style={styles.btnText}>{t('forgot_password.send_code')}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('register.already_account')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>{t('register.log_in')}</Text>
            </TouchableOpacity>
          </View>
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
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.onSurface,
    marginBottom: 4,
  },
  btn: {
    backgroundColor: Colors.electric,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  btnText: { color: Colors.black, fontWeight: '900', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: Colors.mutedGray },
  footerLink: { color: Colors.electric, fontWeight: '700' },
});