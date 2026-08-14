import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import type { ThemeColors } from '../../src/theme/colors';
import { clamp } from '../../src/utils/format';

interface FormFieldProps extends TextInputProps {
  label?: string;
  /** Small helper shown under the input (hint or inline validation). */
  hint?: string;
  hintTone?: 'muted' | 'ok' | 'error';
  /** Right-hand adornment, e.g. the "kg" / "cm" suffix. */
  suffix?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  hint,
  hintTone = 'muted',
  suffix,
  style,
  ...inputProps
}) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const hintColor =
    hintTone === 'ok' ? colors.success : hintTone === 'error' ? colors.error : colors.mutedGray;

  return (
    <View style={styles.fieldWrap}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputRow}>
        <TextInput
          placeholderTextColor={colors.mutedGray}
          {...inputProps}
          style={[styles.input, !!suffix && styles.inputWithSuffix, style]}
        />
        {!!suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
      {!!hint && <Text style={[styles.hint, { color: hintColor }]}>{hint}</Text>}
    </View>
  );
};

interface PasswordFieldProps extends FormFieldProps {
  /** 0–3; renders the strength meter from designs 01b and 08e. */
  strength?: number;
  strengthLabel?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  hint,
  strength,
  strengthLabel,
  ...inputProps
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const styles = makeStyles(colors);

  const meterColor =
    strength === undefined
      ? colors.border
      : strength >= 3
        ? colors.success
        : strength === 2
          ? colors.warning
          : colors.error;

  return (
    <View style={styles.fieldWrap}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputRow}>
        <TextInput
          placeholderTextColor={colors.mutedGray}
          autoCapitalize="none"
          {...inputProps}
          secureTextEntry={!visible}
          style={[styles.input, styles.inputWithSuffix]}
        />
        <TouchableOpacity onPress={() => setVisible((v) => !v)} hitSlop={10}>
          <Text style={styles.reveal}>{visible ? t('common.hide') : t('common.show')}</Text>
        </TouchableOpacity>
      </View>

      {strength !== undefined && (
        <View style={styles.meterRow}>
          <View style={styles.meterTrack}>
            {[1, 2, 3].map((step) => (
              <View
                key={step}
                style={[
                  styles.meterSegment,
                  { backgroundColor: strength >= step ? meterColor : colors.border },
                ]}
              />
            ))}
          </View>
          {!!strengthLabel && (
            <Text style={[styles.meterLabel, { color: meterColor }]}>{strengthLabel}</Text>
          )}
        </View>
      )}

      {!!hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

interface StepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Unit rendered next to the number ("buổi", "kg"). */
  unit?: string;
  label?: string;
}

/** −  N  +  control used by onboarding, exercise form and weekly goal. */
export const Stepper: React.FC<StepperProps> = ({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  unit,
  label,
}) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={styles.stepperWrap}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.stepperRow}>
        <TouchableOpacity
          onPress={() => onChange(clamp(value - step, min, max))}
          style={styles.stepperBtn}
          disabled={value <= min}
        >
          <Icon name="minus" size={18} color={value <= min ? colors.border : colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.stepperValueWrap}>
          <Text style={styles.stepperValue}>
            {Number.isInteger(value) ? value : value.toFixed(1)}
          </Text>
          {!!unit && <Text style={styles.stepperUnit}>{unit}</Text>}
        </View>
        <TouchableOpacity
          onPress={() => onChange(clamp(value + step, min, max))}
          style={styles.stepperBtn}
          disabled={value >= max}
        >
          <Icon name="plus" size={18} color={value >= max ? colors.border : colors.onSurface} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface SearchInputProps extends TextInputProps {}

export const SearchInput: React.FC<SearchInputProps> = (props) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={styles.searchWrap}>
      <Icon name="search" size={16} color={colors.mutedGray} />
      <TextInput
        placeholderTextColor={colors.mutedGray}
        autoCapitalize="none"
        {...props}
        style={styles.searchInput}
      />
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    fieldWrap: { marginBottom: 16 },
    label: {
      color: colors.mutedGray,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingRight: 14,
    },
    input: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      color: colors.onSurface,
    },
    inputWithSuffix: { paddingRight: 8 },
    suffix: { color: colors.mutedGray, fontSize: 13, fontWeight: '700' },
    reveal: {
      color: colors.electric,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    hint: { marginTop: 6, fontSize: 11, color: colors.mutedGray },
    meterRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
    meterTrack: { flex: 1, flexDirection: 'row', gap: 4 },
    meterSegment: { flex: 1, height: 4, borderRadius: 2 },
    meterLabel: { fontSize: 11, fontWeight: '800' },
    stepperWrap: { marginBottom: 16 },
    stepperRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    stepperBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperValueWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
    stepperValue: { fontSize: 26, fontWeight: '900', color: colors.electric },
    stepperUnit: { fontSize: 12, color: colors.mutedGray, fontWeight: '700' },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
    },
    searchInput: { flex: 1, paddingVertical: 13, fontSize: 14, color: colors.onSurface },
  });
