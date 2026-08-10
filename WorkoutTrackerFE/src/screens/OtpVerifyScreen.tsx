import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { AuthStackParamList } from '../navigation/types';

type OtpVerifyNav = NativeStackNavigationProp<AuthStackParamList>;
type OtpVerifyRoute = RouteProp<AuthStackParamList, 'OtpVerify'>;

const CODE_LENGTH = 6;
const RESEND_SECONDS = 42;

export default function OtpVerifyScreen() {
  const navigation = useNavigation<OtpVerifyNav>();
  const route = useRoute<OtpVerifyRoute>();
  const email = route.params?.email || '';

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleChange = (value: string, index: number) => {
    const next = [...digits];
    next[index] = value.replace(/[^0-9]/g, '').slice(-1);
    setDigits(next);
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const code = digits.join('');
  const isComplete = code.length === CODE_LENGTH;

  const handleConfirm = () => {
    setIsSubmitting(true);
    // NOTE: backend chưa có endpoint xác thực OTP — đây là luồng UI mẫu.
    // Khi API sẵn sàng, thay đoạn dưới bằng: await authApi.verifyResetCode(email, code)
    setTimeout(() => {
      setIsSubmitting(false);
      navigation.navigate('Login');
    }, 600);
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;
    setSecondsLeft(RESEND_SECONDS);
    setDigits(Array(CODE_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.inner}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={20} color={Colors.onSurface} />
        </TouchableOpacity>

        <Text style={styles.title}>NHẬP MÃ XÁC THỰC</Text>
        <Text style={styles.subtitle}>
          Mã gồm 6 số đã gửi tới{'\n'}
          <Text style={styles.emailText}>{email || 'email của bạn'}</Text>
        </Text>

        <View style={styles.codeRow}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(v) => handleChange(v, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              style={[styles.codeBox, digit ? styles.codeBoxFilled : null]}
            />
          ))}
        </View>

        <Text style={styles.timerText}>
          Gửi lại mã sau {secondsLeft > 0 ? `${mm}:${ss}` : ''}
        </Text>

        <TouchableOpacity
          onPress={handleConfirm}
          disabled={!isComplete || isSubmitting}
          style={[styles.btn, (!isComplete || isSubmitting) && styles.btnDisabled]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.black} />
          ) : (
            <Text style={styles.btnText}>Xác nhận</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} disabled={secondsLeft > 0} style={styles.resendRow}>
          <Text style={[styles.resendText, secondsLeft > 0 && styles.resendTextDisabled]}>
            Không nhận được mã? Gửi lại
          </Text>
        </TouchableOpacity>
      </View>
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
  title: { fontSize: 22, fontWeight: '900', color: Colors.onSurface, textAlign: 'center', marginBottom: 12, letterSpacing: 1 },
  subtitle: { fontSize: 13, color: Colors.mutedGray, textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  emailText: { color: Colors.onSurface, fontWeight: '700' },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  codeBox: {
    width: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    color: Colors.onSurface,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  codeBoxFilled: {
    borderColor: Colors.electric,
  },
  timerText: {
    textAlign: 'center',
    color: Colors.mutedGray,
    fontSize: 12,
    marginBottom: 24,
  },
  btn: {
    backgroundColor: Colors.electric,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: Colors.electricDim,
  },
  btnText: { color: Colors.black, fontWeight: '900', fontSize: 16 },
  resendRow: { marginTop: 20, alignItems: 'center' },
  resendText: { color: Colors.electric, fontWeight: '700', fontSize: 13 },
  resendTextDisabled: { color: Colors.mutedGray },
});