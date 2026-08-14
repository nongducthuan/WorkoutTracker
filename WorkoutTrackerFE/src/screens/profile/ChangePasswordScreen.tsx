import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { authApi } from '../../api/auth';
import { useToast } from '../../../components/Toast';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { PasswordField, PrimaryButton } from '../../../components/ui';
import { passwordStrength, isPasswordValid } from '../../utils/password';

/** Design 08e · Đổi mật khẩu. */
export default function ChangePasswordScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { success, error } = useToast();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSaving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const strength = passwordStrength(next);
  const strengthLabel =
    strength >= 3
      ? t('register.strength_strong')
      : strength === 2
        ? t('register.strength_medium')
        : t('register.strength_weak');

  const submit = async () => {
    setFormError('');
    if (!current || !next || !confirm) {
      setFormError(t('register.fill_all'));
      return;
    }
    if (!isPasswordValid(next)) {
      setFormError(t('register.password_rule'));
      return;
    }
    if (next !== confirm) {
      setFormError(t('register.password_mismatch'));
      return;
    }

    setSaving(true);
    try {
      await authApi.changePassword(current, next);
      success(t('profile.password_success'));
      navigation.goBack();
    } catch (e: any) {
      const message = e?.response?.data?.message || t('profile.password_failed');
      setFormError(message);
      error(t('profile.password_failed'));
    } finally {
      setSaving(false);
    }
  };

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader title={t('profile.change_password_title')} />

          <Text style={styles.rule}>{t('register.password_rule')}</Text>

          {!!formError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          )}

          <PasswordField
            label={t('profile.current_password')}
            value={current}
            onChangeText={setCurrent}
            placeholder="••••••••"
          />
          <PasswordField
            label={t('profile.new_password')}
            value={next}
            onChangeText={setNext}
            placeholder="••••••••"
            strength={strength}
            strengthLabel={next ? strengthLabel : undefined}
          />
          <PasswordField
            label={t('profile.confirm_new_password')}
            value={confirm}
            onChangeText={setConfirm}
            placeholder="••••••••"
            hint={confirm && confirm !== next ? t('register.password_mismatch') : undefined}
          />

          <PrimaryButton
            label={isSaving ? t('profile.updating') : t('profile.update_password')}
            onPress={submit}
            loading={isSaving}
            style={styles.submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    rule: { fontSize: 12, color: colors.mutedGray, lineHeight: 19, marginBottom: 20 },
    errorBox: {
      backgroundColor: 'rgba(239,68,68,0.14)',
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.4)',
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
    },
    errorText: { color: colors.error, fontSize: 12, fontWeight: '700', textAlign: 'center' },
    submit: { marginTop: 8 },
  });
