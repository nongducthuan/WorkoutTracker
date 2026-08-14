import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';

/** "Mẹo cho hôm nay" card from design 02. */
export const TipCard: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(colors);

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Icon name="info" size={16} color={colors.electric} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{t('dashboard.tip_title')}</Text>
        <Text style={styles.body}>{t('dashboard.tip_body')}</Text>
      </View>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      gap: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
      marginBottom: 20,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.electricBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textWrap: { flex: 1 },
    title: {
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.onSurface,
      marginBottom: 6,
    },
    body: { fontSize: 13, color: colors.mutedGray, lineHeight: 19 },
  });
