import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';

type WelcomeNav = NativeStackNavigationProp<AuthStackParamList>;

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<WelcomeNav>();

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.inner}>
        <View style={styles.logoSection}>
          <View style={styles.logoRow}>
            <Svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.electric} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M6 18h12M6 6h12M12 6v12M2 12h4M18 12h4" />
            </Svg>
            <Text style={styles.logoText}>PULSE</Text>
          </View>
          <Text style={styles.logoSub}>{t('login.subtitle')}</Text>
        </View>

        <Text style={styles.heroTitle}>
          {t('welcome.hero_title')}
        </Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>{t('welcome.login')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryBtnText}>{t('welcome.register')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  logoSection: { alignItems: 'center', marginBottom: 48 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  logoText: { fontSize: 40, fontWeight: '900', color: colors.onSurface, letterSpacing: -1 },
  logoSub: { color: colors.electricOrange, fontSize: 12, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase' },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.onSurface,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 48,
  },
  buttonGroup: { gap: 12 },
  primaryBtn: {
    backgroundColor: colors.electric,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: { color: colors.black, fontWeight: '900', fontSize: 16 },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryBtnText: { color: colors.onSurface, fontWeight: '700', fontSize: 16 },
});