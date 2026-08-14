import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../src/context/ThemeContext';
import type { ThemeColors } from '../src/theme/colors';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Defaults to navigation.goBack(). Pass `null` to hide the back button. */
  onBack?: (() => void) | null;
  /** Uses ✕ instead of ‹ — for modal-like screens (04b, 04f, 06b). */
  closeIcon?: boolean;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * The single header used across every stack screen: back control on the left,
 * centred title, optional right slot. Replaces the ad-hoc header each screen
 * used to hand-roll (and the duplicate navigator header on the tabs).
 */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onBack,
  closeIcon,
  right,
  style,
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const styles = makeStyles(colors);

  const handleBack = onBack === undefined ? () => navigation.goBack() : onBack;

  return (
    <View style={[styles.header, style]}>
      {handleBack ? (
        <TouchableOpacity onPress={handleBack} style={styles.iconButton} hitSlop={8}>
          <Icon
            name={closeIcon ? 'x' : 'chevron-left'}
            size={20}
            color={colors.onSurface}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButton} />
      )}

      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.rightSlot}>{right || <View style={styles.iconButton} />}</View>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 20,
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleWrap: { flex: 1, alignItems: 'center' },
    title: {
      fontSize: 15,
      fontWeight: '900',
      letterSpacing: 1.4,
      color: colors.onSurface,
      textTransform: 'uppercase',
      textAlign: 'center',
    },
    subtitle: { fontSize: 11, color: colors.mutedGray, marginTop: 2, textAlign: 'center' },
    rightSlot: { minWidth: 36, alignItems: 'flex-end' },
  });
