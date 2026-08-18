import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';

interface AuthLayoutProps {
  children: React.ReactNode;
  /** Big screen heading under the logo. */
  title?: string;
  subtitle?: string;
  /** Shows the PULSE wordmark (login/register only). */
  showLogo?: boolean;
  showBack?: boolean;
  /** Circular icon above the title (designs 01c and 01d). */
  icon?: string;
}

/**
 * Shared chrome for every auth screen: logo, optional back button, centred
 * card layout and keyboard handling — so the six auth screens stay visually
 * identical without repeating 60 lines of styles each.
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showLogo,
  showBack = true,
  icon,
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {showBack && navigation.canGoBack() && (
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Icon name="chevron-left" size={20} color={colors.onSurface} />
            </TouchableOpacity>
          )}

          {showLogo && (
            <View style={styles.logoWrap}>
              <View style={styles.logoRow}>
                <Svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={colors.electric} strokeWidth="2" strokeLinecap="round">
                  <Path d="M6 18h12M6 6h12M12 6v12M2 12h4M18 12h4" />
                </Svg>
                <Text style={styles.logoText}>PULSE</Text>
              </View>
            </View>
          )}

          {!!icon && (
            <View style={styles.iconCircle}>
              <Icon name={icon as any} size={26} color={colors.electric} />
            </View>
          )}

          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/** Inline validation banner shared by the auth forms. */
export const AuthError: React.FC<{ message?: string }> = ({ message }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  if (!message) return null;
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
};

/** "Chưa có tài khoản? Đăng ký" footer link. */
export const AuthFooterLink: React.FC<{
  label: string;
  action: string;
  onPress: () => void;
}> = ({ label, action, onPress }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>{label} </Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.footerLink}>{action}</Text>
      </TouchableOpacity>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, padding: 28, paddingTop: Platform.OS === 'ios' ? 60 : 80, paddingBottom: 40 },
    backBtn: {
      position: 'absolute',
      top: 12,
      left: 20,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoWrap: { alignItems: 'center', marginBottom: 28 },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logoText: { fontSize: 32, fontWeight: '900', color: colors.onSurface, letterSpacing: -1 },
    iconCircle: {
      width: 62,
      height: 62,
      borderRadius: 31,
      alignSelf: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: '900',
      color: colors.onSurface,
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 13,
      color: colors.mutedGray,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 26,
    },
    errorBox: {
      backgroundColor: 'rgba(239,68,68,0.14)',
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.4)',
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
    },
    errorText: { color: colors.error, textAlign: 'center', fontWeight: '700', fontSize: 12 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    footerText: { color: colors.mutedGray, fontSize: 13 },
    footerLink: { color: colors.electric, fontWeight: '900', fontSize: 13 },
  });
