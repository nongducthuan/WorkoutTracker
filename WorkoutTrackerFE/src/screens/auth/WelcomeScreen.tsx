import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { PrimaryButton, GhostButton } from '../../../components/ui';

type WelcomeNav = NativeStackNavigationProp<AuthStackParamList>;

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<WelcomeNav>();
  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.logoRow}>
          <Svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={colors.electric} strokeWidth="2" strokeLinecap="round">
            <Path d="M6 18h12M6 6h12M12 6v12M2 12h4M18 12h4" />
          </Svg>
          <Text style={styles.logo}>PULSE</Text>
        </View>
        <Text style={styles.tagline}>{t('login.subtitle')}</Text>
        <Text style={styles.hero}>{t('welcome.hero_title')}</Text>

        <PrimaryButton
          label={t('welcome.login')}
          onPress={() => navigation.navigate('Login')}
          style={styles.primaryBtn}
        />
        <GhostButton label={t('welcome.register')} onPress={() => navigation.navigate('Register')} />
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
    logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    logo: { fontSize: 40, fontWeight: '900', color: colors.onSurface, letterSpacing: -1.5 },
    tagline: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 3,
      textTransform: 'uppercase',
      color: colors.electricOrange,
      textAlign: 'center',
      marginTop: 10,
    },
    hero: {
      fontSize: 26,
      fontWeight: '900',
      color: colors.onSurface,
      textAlign: 'center',
      marginTop: 40,
      marginBottom: 40,
    },
    primaryBtn: { marginBottom: 12 },
  });
