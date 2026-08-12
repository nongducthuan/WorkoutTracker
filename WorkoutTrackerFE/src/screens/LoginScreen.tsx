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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../api/auth';
import { Colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type LoginNav = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<LoginNav>();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError(t('login.login_failed'));
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      await authApi.login(identifier, password);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err: any) {
      setError(err.message || t('login.login_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.keyboardView} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
      <View style={styles.inner}>
        <View style={styles.logoSection}>
          <View style={styles.logoRow}>
            <Svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={Colors.electric} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M6 18h12M6 6h12M12 6v12M2 12h4M18 12h4" />
            </Svg>
            <Text style={styles.logoText}>PULSE</Text>
          </View>
          <Text style={styles.logoSub}>{t('login.subtitle')}</Text>
        </View>

        <Text style={styles.title}>{t('login.title')}</Text>

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>{t('login.email_label')}</Text>
          <TextInput
            value={identifier}
            onChangeText={setIdentifier}
            placeholder={t('login.email_hint')}
            placeholderTextColor={Colors.mutedGray}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>{t('login.password_label')}</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t('login.password_hint')}
            placeholderTextColor={Colors.mutedGray}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            onPress={() => (navigation as any).navigate('ForgotPassword')}
            style={styles.forgotPasswordLink}
          >
            <Text style={styles.forgotPasswordText}>{t('login.forgot_password')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            style={[styles.btn, isLoading && { backgroundColor: Colors.electricDim }]}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.black} />
            ) : (
              <Text style={styles.btnText}>{t('login.submit')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('login.no_account')} </Text>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Register')}>
            <Text style={styles.footerLink}>{t('login.sign_up')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  logoText: { fontSize: 36, fontWeight: '900', color: Colors.onSurface, letterSpacing: -1 },
  logoSub: { color: Colors.electricOrange, fontSize: 12, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase' },
  title: { fontSize: 24, fontWeight: '700', color: Colors.onSurface, textAlign: 'center', marginBottom: 32 },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#FC8181', textAlign: 'center', fontWeight: '600' },
  form: { gap: 4 },
  forgotPasswordLink: { alignSelf: 'flex-end', marginTop: 10 },
  forgotPasswordText: { color: Colors.electric, fontSize: 12, fontWeight: '700' },
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
    elevation: 5,
    shadowColor: Colors.electric,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  btnText: { color: Colors.black, fontWeight: '900', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: Colors.mutedGray },
  footerLink: { color: Colors.electric, fontWeight: '700' },
});