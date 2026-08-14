import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../src/context/ThemeContext';
import type { ThemeColors } from '../src/theme/colors';

interface ErrorStateProps {
  /** Defaults to the "Mất kết nối" copy from design 11. */
  title?: string;
  description?: string;
  onRetry?: () => void;
  /** Shows the "Dùng chế độ ngoại tuyến" escape hatch. */
  onOffline?: () => void;
  fullScreen?: boolean;
}

/**
 * Design 11 · Lỗi kết nối. Rendered whenever a react-query hook reports
 * `isError`, so a dead backend no longer looks like an empty screen.
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  onRetry,
  onOffline,
  fullScreen = true,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(colors);

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <View style={styles.iconCircle}>
        <Icon name="wifi-off" size={30} color={colors.electricOrange} />
      </View>
      <Text style={styles.title}>{title || t('error.offline_title')}</Text>
      <Text style={styles.description}>{description || t('error.offline_desc')}</Text>

      {!!onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Icon name="refresh-cw" size={15} color={colors.black} />
          <Text style={styles.retryText}>{t('error.retry')}</Text>
        </TouchableOpacity>
      )}
      {!!onOffline && (
        <TouchableOpacity style={styles.offlineBtn} onPress={onOffline}>
          <Text style={styles.offlineText}>{t('error.use_offline')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center', padding: 32 },
    fullScreen: { flex: 1, backgroundColor: colors.background },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: 'rgba(255,107,53,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(255,107,53,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: '900',
      color: colors.onSurface,
      marginBottom: 10,
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    description: {
      fontSize: 13,
      color: colors.mutedGray,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 26,
    },
    retryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.electric,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 12,
    },
    retryText: { color: colors.black, fontWeight: '900', fontSize: 14 },
    offlineBtn: { marginTop: 14, paddingVertical: 8 },
    offlineText: { color: colors.mutedGray, fontSize: 13, textDecorationLine: 'underline' },
  });
