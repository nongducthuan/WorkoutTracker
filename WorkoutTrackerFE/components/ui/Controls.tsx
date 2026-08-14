import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../src/context/ThemeContext';
import type { ThemeColors } from '../../src/theme/colors';

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
  icon?: string;
}

interface SegmentedControlProps<T extends string | number> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
  /** Compact pills used inside cards (VI/EN, kg/lb). */
  compact?: boolean;
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  style,
  compact,
}: SegmentedControlProps<T>) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={[styles.segmentWrap, compact && styles.segmentWrapCompact, style]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            key={String(opt.value)}
            onPress={() => onChange(opt.value)}
            style={[
              styles.segment,
              compact && styles.segmentCompact,
              active && styles.segmentActive,
            ]}
          >
            {!!opt.icon && (
              <Icon
                name={opt.icon as any}
                size={compact ? 12 : 14}
                color={active ? colors.black : colors.mutedGray}
              />
            )}
            <Text
              style={[
                styles.segmentText,
                compact && styles.segmentTextCompact,
                active && styles.segmentTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

interface ToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (next: boolean) => void;
  icon?: string;
  style?: StyleProp<ViewStyle>;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({
  label,
  description,
  value,
  onChange,
  icon,
  style,
}) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={[styles.row, style]}>
      <View style={styles.rowLeft}>
        {!!icon && <Icon name={icon as any} size={18} color={colors.mutedGray} />}
        <View style={styles.rowTextWrap}>
          <Text style={styles.rowLabel}>{label}</Text>
          {!!description && <Text style={styles.rowDesc}>{description}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.electricDim }}
        thumbColor={value ? colors.electric : colors.mutedGray}
      />
    </View>
  );
};

interface NavRowProps {
  label: string;
  onPress: () => void;
  icon?: string;
  value?: string;
  style?: StyleProp<ViewStyle>;
}

/** Settings/profile navigation row with a chevron. */
export const NavRow: React.FC<NavRowProps> = ({ label, onPress, icon, value, style }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <TouchableOpacity onPress={onPress} style={[styles.row, style]}>
      <View style={styles.rowLeft}>
        {!!icon && <Icon name={icon as any} size={18} color={colors.mutedGray} />}
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {!!value && <Text style={styles.rowValue}>{value}</Text>}
        <Icon name="chevron-right" size={18} color={colors.mutedGray} />
      </View>
    </TouchableOpacity>
  );
};

/** Grouped card wrapper for a run of ToggleRow / NavRow items. */
export const SettingsGroup: React.FC<{
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}> = ({ children, style }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <View style={[styles.group, style]}>
      {items.map((child, idx) => (
        <View key={idx} style={idx < items.length - 1 ? styles.groupDivider : undefined}>
          {child}
        </View>
      ))}
    </View>
  );
};

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const Chip: React.FC<ChipProps> = ({ label, active, onPress, style }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[styles.chip, active && styles.chipActive, style]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    segmentWrap: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 4,
      gap: 4,
    },
    segmentWrapCompact: { borderRadius: 9, padding: 3, gap: 3 },
    segment: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 9,
    },
    segmentCompact: { flex: 0, paddingVertical: 5, paddingHorizontal: 12, borderRadius: 7 },
    segmentActive: { backgroundColor: colors.electric },
    segmentText: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.mutedGray,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    segmentTextCompact: { fontSize: 11 },
    segmentTextActive: { color: colors.black },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    rowTextWrap: { flex: 1 },
    rowLabel: { fontSize: 13, fontWeight: '800', color: colors.onSurface },
    rowDesc: { fontSize: 11, color: colors.mutedGray, marginTop: 2 },
    rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rowValue: { fontSize: 12, color: colors.mutedGray, fontWeight: '700' },
    group: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
    },
    groupDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    chipActive: { backgroundColor: colors.electric, borderColor: colors.electric },
    chipText: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.mutedGray,
      textTransform: 'uppercase',
    },
    chipTextActive: { color: colors.black },
  });
