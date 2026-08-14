import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../src/context/ThemeContext';
import type { ThemeColors } from '../../src/theme/colors';
import { clamp } from '../../src/utils/format';

/** Uppercase small caps heading used above every section. */
export const SectionLabel: React.FC<{ children: React.ReactNode; style?: StyleProp<ViewStyle> }> = ({
  children,
  style,
}) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={style}>
      <Text style={styles.sectionLabel}>{children}</Text>
    </View>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  /** Renders the value in volt green (design uses it for the hero metric). */
  highlight?: boolean;
  caption?: string;
  style?: StyleProp<ViewStyle>;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  icon,
  highlight,
  caption,
  style,
}) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={[styles.statCard, style]}>
      <View style={styles.statHeader}>
        <Text style={styles.statLabel} numberOfLines={1}>
          {label}
        </Text>
        {!!icon && <Icon name={icon as any} size={14} color={colors.mutedGray} />}
      </View>
      <View style={styles.statValueRow}>
        <Text style={[styles.statValue, highlight && { color: colors.electric }]}>{value}</Text>
        {!!unit && <Text style={styles.statUnit}>{unit}</Text>}
      </View>
      {!!caption && <Text style={styles.statCaption}>{caption}</Text>}
    </View>
  );
};

interface BadgeProps {
  label: string;
  tone?: 'electric' | 'muted' | 'orange' | 'success';
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({ label, tone = 'muted', style }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const palette = {
    electric: { bg: colors.electric, fg: colors.black },
    muted: { bg: colors.surface, fg: colors.mutedGray },
    orange: { bg: 'rgba(255,107,53,0.15)', fg: colors.electricOrange },
    success: { bg: 'rgba(34,197,94,0.15)', fg: colors.success },
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }, style]}>
      <Text style={[styles.badgeText, { color: palette.fg }]}>{label}</Text>
    </View>
  );
};

interface ProgressBarProps {
  /** 0–1 */
  value: number;
  color?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, color, height = 6, style }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const pct = `${clamp(value, 0, 1) * 100}%` as const;

  return (
    <View style={[styles.progressTrack, { height, borderRadius: height / 2 }, style]}>
      <View
        style={{
          width: pct,
          height: '100%',
          borderRadius: height / 2,
          backgroundColor: color || colors.electric,
        }}
      />
    </View>
  );
};

/** Card shell reused by list rows so padding and borders stay identical everywhere. */
export const Card: React.FC<{ children: React.ReactNode; style?: StyleProp<ViewStyle> }> = ({
  children,
  style,
}) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return <View style={[styles.card, style]}>{children}</View>;
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    sectionLabel: {
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 1.5,
      color: colors.mutedGray,
      textTransform: 'uppercase',
      marginBottom: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 14,
    },
    statHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
      gap: 6,
    },
    statLabel: {
      flex: 1,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.mutedGray,
      textTransform: 'uppercase',
    },
    statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
    statValue: { fontSize: 24, fontWeight: '900', color: colors.onSurface },
    statUnit: { fontSize: 11, fontWeight: '700', color: colors.mutedGray },
    statCaption: { marginTop: 6, fontSize: 10, color: colors.mutedGray },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    progressTrack: {
      width: '100%',
      backgroundColor: colors.border,
      overflow: 'hidden',
    },
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
    },
  });
