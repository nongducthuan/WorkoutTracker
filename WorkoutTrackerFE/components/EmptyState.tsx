import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../src/context/ThemeContext';
import type { ThemeColors } from '../src/theme/colors';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  /** Optional link shown under the primary action (design 09). */
  secondaryText?: string;
  onSecondary?: () => void;
  icon?: React.ReactNode;
  iconName?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  secondaryText,
  onSecondary,
  icon,
  iconName = 'inbox',
}) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        {icon || <Icon name={iconName as any} size={30} color={colors.mutedGray} />}
      </View>
      <Text style={styles.title}>{title}</Text>
      {!!description && <Text style={styles.description}>{description}</Text>}
      {!!actionText && !!onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
      {!!secondaryText && !!onSecondary && (
        <TouchableOpacity onPress={onSecondary} style={styles.secondary}>
          <Text style={styles.secondaryText}>{secondaryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      paddingHorizontal: 24,
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: '900',
      color: colors.onSurface,
      marginBottom: 8,
      textAlign: 'center',
    },
    description: {
      fontSize: 13,
      color: colors.mutedGray,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
    },
    button: {
      backgroundColor: colors.electric,
      paddingHorizontal: 22,
      paddingVertical: 13,
      borderRadius: 12,
    },
    buttonText: { color: colors.black, fontWeight: '900', fontSize: 14 },
    secondary: { marginTop: 14 },
    secondaryText: { color: colors.mutedGray, fontSize: 13, textDecorationLine: 'underline' },
  });
