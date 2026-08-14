import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { authApi } from '../../api/auth';
import { useToast } from '../../../components/Toast';
import { PrimaryButton } from '../../../components/ui';
import { AuthLayout, AuthError } from './components/AuthLayout';
import { formatCountdown } from '../../utils/date';

type OtpNav = NativeStackNavigationProp<AuthStackParamList>;
type OtpRoute = RouteProp<AuthStackParamList, 'OtpVerify'>;

const CODE_LENGTH = 6;
const RESEND_SECONDS = 42;

/** Design 01d · Xác thực OTP. */
export default function OtpVerifyScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<OtpNav>();
  const route = useRoute<OtpRoute>();
  const { success } = useToast();
  const email = route.params?.email || '';

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isResending, setResending] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const code = digits.join('');
  const isComplete = code.length === CODE_LENGTH;

  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < CODE_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const confirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      const result = await authApi.verifyOtp(email, code);
      navigation.navigate('ResetPassword', { resetToken: result.resetToken });
    } catch (e: any) {
      const message = e?.response?.data?.message;
      setError(
        message === 'OtpExpired'
          ? t('otp_verify.expired')
          : message === 'OtpIncorrect'
            ? t('otp_verify.incorrect')
            : message === 'OtpAlreadyUsed'
              ? t('otp_verify.already_used')
              : t('otp_verify.failed')
      );
    } finally {
      setSubmitting(false);
    }
  };

  /** Actually re-requests a code — the old screen only reset the countdown. */
  const resend = async () => {
    if (secondsLeft > 0 || !email) return;
    setResending(true);
    setError('');
    try {
      await authApi.forgotPassword(email);
      setDigits(Array(CODE_LENGTH).fill(''));
      setSecondsLeft(RESEND_SECONDS);
      inputs.current[0]?.focus();
      success(t('otp_verify.resent'));
    } catch {
      setError(t('forgot_password.send_failed'));
    } finally {
      setResending(false);
    }
  };

  const styles = makeStyles(colors);

  return (
    <AuthLayout icon="mail" title={t('otp_verify.title')}>
      <Text style={styles.subtitle}>
        {t('otp_verify.subtitle')}
        {'\n'}
        <Text style={styles.email}>{email || t('otp_verify.default_email')}</Text>
      </Text>

      <AuthError message={error} />

      <View style={styles.codeRow}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputs.current[index] = ref;
            }}
            value={digit}
            onChangeText={(value) => handleChange(value, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            keyboardType="number-pad"
            maxLength={1}
            style={[styles.codeBox, digit ? styles.codeBoxFilled : null]}
          />
        ))}
      </View>

      <Text style={styles.timer}>
        {t('otp_verify.resend_in')} {secondsLeft > 0 ? formatCountdown(secondsLeft) : '00:00'}
      </Text>

      <PrimaryButton
        label={t('otp_verify.confirm')}
        onPress={confirm}
        disabled={!isComplete}
        loading={isSubmitting}
      />

      <View style={styles.resendRow}>
        <Text style={styles.resendLabel}>{t('otp_verify.didnt_receive')} </Text>
        <TouchableOpacity onPress={resend} disabled={secondsLeft > 0 || isResending}>
          <Text style={[styles.resendLink, secondsLeft > 0 && styles.resendDisabled]}>
            {t('otp_verify.resend')}
          </Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    subtitle: {
      fontSize: 13,
      color: colors.mutedGray,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
    },
    email: { color: colors.onSurface, fontWeight: '800' },
    codeRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 18 },
    codeBox: {
      width: 44,
      height: 54,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      color: colors.onSurface,
      fontSize: 20,
      fontWeight: '800',
      textAlign: 'center',
    },
    codeBoxFilled: { borderColor: colors.electric },
    timer: { textAlign: 'center', color: colors.mutedGray, fontSize: 12, marginBottom: 22 },
    resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
    resendLabel: { color: colors.mutedGray, fontSize: 13 },
    resendLink: { color: colors.electric, fontWeight: '900', fontSize: 13 },
    resendDisabled: { color: colors.mutedGray },
  });
