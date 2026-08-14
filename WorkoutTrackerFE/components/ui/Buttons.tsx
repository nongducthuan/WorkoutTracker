import React from 'react';
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../src/context/ThemeContext';
import type { ThemeColors } from '../../src/theme/colors';

interface ButtonProps {
  label: string;
  onPress: () => void;
  icon?: string;
  /** Renders the icon after the label instead of before. */
  iconRight?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: 'md' | 'sm';
}

/** Volt-green filled button — the primary CTA on every screen. */
export const PrimaryButton: React.FC<ButtonProps> = ({
  label,
  onPress,
  icon,
  iconRight,
  disabled,
  loading,
  style,
  size = 'md',
}) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const isOff = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isOff}
      style={[styles.primary, size === 'sm' && styles.primarySm, isOff && styles.primaryOff, style]}
    >
      {loading ? (
        <ActivityIndicator color={colors.black} />
      ) : (
        <>
          {!!icon && !iconRight && <Icon name={icon as any} size={16} color={colors.black} />}
          <Text style={[styles.primaryText, size === 'sm' && styles.primaryTextSm]}>{label}</Text>
          {!!icon && iconRight && <Icon name={icon as any} size={16} color={colors.black} />}
        </>
      )}
    </TouchableOpacity>
  );
};

/** Bordered, transparent button for secondary actions. */
export const GhostButton: React.FC<ButtonProps> = ({
  label,
  onPress,
  icon,
  disabled,
  style,
  size = 'md',
}) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.ghost, size === 'sm' && styles.ghostSm, disabled && styles.ghostOff, style]}
    >
      {!!icon && <Icon name={icon as any} size={16} color={colors.onSurface} />}
      <Text style={styles.ghostText}>{label}</Text>
    </TouchableOpacity>
  );
};

/** Destructive action (huỷ lịch, xoá giáo án). */
export const DangerButton: React.FC<ButtonProps> = ({ label, onPress, icon, style }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <TouchableOpacity onPress={onPress} style={[styles.danger, style]}>
      {!!icon && <Icon name={icon as any} size={16} color={colors.electricOrange} />}
      <Text style={styles.dangerText}>{label}</Text>
    </TouchableOpacity>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    primary: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.electric,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    primarySm: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
    primaryOff: { opacity: 0.5 },
    primaryText: {
      color: colors.black,
      fontWeight: '900',
      fontSize: 15,
      letterSpacing: 0.5,
    },
    primaryTextSm: { fontSize: 12 },
    ghost: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 15,
      paddingHorizontal: 20,
    },
    ghostSm: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 10 },
    ghostOff: { opacity: 0.5 },
    ghostText: { color: colors.onSurface, fontWeight: '800', fontSize: 14 },
    danger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,107,53,0.45)',
      backgroundColor: 'rgba(255,107,53,0.10)',
    },
    dangerText: {
      color: colors.electricOrange,
      fontWeight: '900',
      fontSize: 14,
      letterSpacing: 1,
    },
  });
