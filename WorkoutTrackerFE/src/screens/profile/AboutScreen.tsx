import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { SectionLabel } from '../../../components/ui';

const APP_VERSION = '2.1.0';
const SUPPORT_EMAIL = 'support@pulseapp.com';

export default function AboutScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(colors);

  const faq = [
    { q: t('about.faq_q1', 'Làm sao để tạo giáo án mới?'), a: t('about.faq_a1', 'Vào tab Bài tập và chạm nút +.') },
    { q: t('about.faq_q2', 'Chuỗi ngày được tính thế nào?'), a: t('about.faq_a2', 'Mỗi ngày bạn hoàn thành ít nhất một buổi tập sẽ giữ chuỗi.') },
    { q: t('about.faq_q3', 'Đổi đơn vị kg sang lb ở đâu?'), a: t('about.faq_a3', 'Cài đặt chung → Đơn vị khối lượng.') },
  ];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title={t('about.title')} />

        <View style={styles.brand}>
          <Text style={styles.brandName}>PULSE</Text>
          <Text style={styles.brandVersion}>
            {t('settings.version_label')} {APP_VERSION}
          </Text>
        </View>

        <SectionLabel>{t('about.faq')}</SectionLabel>
        {faq.map((item) => (
          <View key={item.q} style={styles.card}>
            <Text style={styles.question}>{item.q}</Text>
            <Text style={styles.answer}>{item.a}</Text>
          </View>
        ))}

        <View style={styles.contact}>
          <Icon name="mail" size={16} color={colors.electric} />
          <Text style={styles.contactText}>{SUPPORT_EMAIL}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    brand: { alignItems: 'center', paddingVertical: 22 },
    brandName: { fontSize: 30, fontWeight: '900', color: colors.onSurface, letterSpacing: -1 },
    brandVersion: { fontSize: 12, color: colors.mutedGray, marginTop: 6 },
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    question: { fontSize: 13, fontWeight: '800', color: colors.onSurface },
    answer: { fontSize: 12, color: colors.mutedGray, marginTop: 6, lineHeight: 18 },
    contact: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 20,
    },
    contactText: { fontSize: 13, color: colors.onSurface, fontWeight: '700' },
  });
