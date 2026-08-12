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
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../api/auth';
import { Colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type RegisterNav = NativeStackNavigationProp<RootStackParamList>;

export default function RegisterScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<RegisterNav>();
  const [fullName, setFullName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!fullName || !userName || !email || !password) {
      setError(t('register.fill_all'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('register.password_mismatch'));
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      await authApi.register(fullName, userName, email, password);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err: any) {
      setError(err.message || t('register.register_failed'));
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
      <ScrollView contentContainerStyle={styles.scrollInner}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={Colors.onSurface} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M15 18l-6-6 6-6" />
          </Svg>
        </TouchableOpacity>

        <View style={styles.logoSection}>
          <View style={styles.logoRow}>
            <Svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={Colors.electric} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M6 18h12M6 6h12M12 6v12M2 12h4M18 12h4" />
            </Svg>
            <Text style={styles.logoText}>PULSE</Text>
          </View>
          <Text style={styles.logoSub}>{t('login.subtitle')}</Text>
        </View>

        <Text style={styles.title}>{t('register.title_screen')}</Text>

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>{t('register.name_label')}</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder={t('register.name_placeholder')}
            placeholderTextColor={Colors.mutedGray}
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>{t('register.username_label')}</Text>
          <TextInput
            value={userName}
            onChangeText={setUserName}
            placeholder={t('register.username_placeholder')}
            placeholderTextColor={Colors.mutedGray}
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>{t('login.email_label')}</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
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

          <Text style={[styles.label, { marginTop: 16 }]}>{t('register.confirm_password_label')}</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('register.confirm_password_hint')}
            placeholderTextColor={Colors.mutedGray}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            style={[styles.btn, isLoading && { backgroundColor: Colors.electricDim }]}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.black} />
            ) : (
              <Text style={styles.btnText}>{t('register.sign_up')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('register.already_account')} </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login' as any)}>
            <Text style={styles.footerLink}>{t('register.log_in')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: Colors.background },
  scrollInner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 40 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoSection: { alignItems: 'center', marginBottom: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  logoText: { fontSize: 36, fontWeight: '900', color: Colors.onSurface, letterSpacing: -1 },
  logoSub: { color: Colors.electricOrange, fontSize: 12, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase' },
  title: { fontSize: 24, fontWeight: '700', color: Colors.onSurface, textAlign: 'center', marginBottom: 24 },
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
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: Colors.mutedGray },
  footerLink: { color: Colors.electric, fontWeight: '700' },
});