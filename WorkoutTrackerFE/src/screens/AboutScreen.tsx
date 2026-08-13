import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';

type AboutNav = NativeStackNavigationProp<RootStackParamList>;

const FAQ = [
  {
    q: 'Làm sao để tạo giáo án tập mới?',
    a: 'Vào tab Bài tập → bấm nút "Tạo mới" → điền tên và mô tả giáo án.',
  },
  {
    q: 'Tôi có thể đổi ngôn ngữ ứng dụng không?',
    a: 'Vào Hồ sơ → Cài đặt → chọn Ngôn ngữ để chuyển giữa Tiếng Việt và English.',
  },
  {
    q: 'Dữ liệu tập luyện của tôi được lưu ở đâu?',
    a: 'Toàn bộ giáo án, lịch tập và báo cáo được đồng bộ với tài khoản của bạn trên máy chủ.',
  },
];

export default function AboutScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<AboutNav>();

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Feather name="chevron-left" size={20} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('about.title')}</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={styles.brandCard}>
          <Text style={styles.brandName}>PULSE</Text>
          <Text style={styles.brandVersion}>{t('settings.version')} 2.1.0</Text>
        </View>

        <Text style={styles.sectionLabel}>{t('about.faq')}</Text>
        <View style={styles.group}>
          {FAQ.map((item, idx) => (
            <View
              key={item.q}
              style={[styles.faqItem, idx === FAQ.length - 1 && styles.faqItemLast]}
            >
              <Text style={styles.faqQuestion}>{item.q}</Text>
              <Text style={styles.faqAnswer}>{item.a}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.contactRow}
          onPress={() => Linking.openURL('mailto:support@pulseapp.com')}
        >
          <Feather name="mail" size={16} color={colors.electric} />
          <Text style={styles.contactText}>support@pulseapp.com</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: colors.onSurface,
    textTransform: 'uppercase',
  },
  brandCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 24,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.electric,
    letterSpacing: 1,
  },
  brandVersion: {
    fontSize: 12,
    color: colors.mutedGray,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.mutedGray,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  group: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  faqItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  faqItemLast: {
    borderBottomWidth: 0,
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 12,
    color: colors.mutedGray,
    lineHeight: 18,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  contactText: {
    color: colors.electric,
    fontSize: 13,
    fontWeight: '600',
  },
});