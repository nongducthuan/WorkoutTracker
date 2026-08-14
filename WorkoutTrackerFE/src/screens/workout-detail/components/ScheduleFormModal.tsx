import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../../components/Modal';
import { PrimaryButton, SectionLabel, Chip, ToggleRow } from '../../../../components/ui';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { useSettings } from '../../../context/SettingsContext';
import { formatFullDate, formatTime } from '../../../utils/date';

export interface ScheduleFormValues {
  /** ISO string of the chosen date + time. */
  scheduledDate: string;
  repeatWeekly: boolean;
  remind: boolean;
}

interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ScheduleFormValues) => Promise<void> | void;
  workoutName?: string;
  workoutMeta?: string;
  initialDate?: string;
  isSaving?: boolean;
}

const atHour = (base: Date, hour: number, minute: number) => {
  const d = new Date(base);
  d.setHours(hour, minute, 0, 0);
  return d;
};

/**
 * Design 06b · Thêm lịch tập. Uses plain steppers instead of a native picker
 * so the flow works identically on every Android version without adding a
 * date-picker dependency.
 */
export const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  workoutName,
  workoutMeta,
  initialDate,
  isSaving,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const styles = makeStyles(colors);

  const [date, setDate] = useState(() => atHour(new Date(), 18, 0));
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [remind, setRemind] = useState(settings.reminderEnabled);

  useEffect(() => {
    if (!isOpen) return;
    setDate(initialDate ? new Date(initialDate) : atHour(new Date(), 18, 0));
    setRepeatWeekly(false);
    setRemind(settings.reminderEnabled);
  }, [isOpen, initialDate, settings.reminderEnabled]);

  const shiftDay = (days: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    setDate(next);
  };

  const shiftMinutes = (minutes: number) => {
    const next = new Date(date);
    next.setMinutes(next.getMinutes() + minutes);
    setDate(next);
  };

  const setRelativeDay = (offset: number) => {
    const base = new Date();
    base.setDate(base.getDate() + offset);
    setDate(atHour(base, date.getHours(), date.getMinutes()));
  };

  const isToday = date.toDateString() === new Date().toDateString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="sheet"
      scrollable
      title={t('schedule.form_title')}
    >
      {!!workoutName && (
        <View style={styles.workoutRow}>
          <View style={styles.workoutIcon}>
            <Icon name="activity" size={18} color={colors.electric} />
          </View>
          <View style={styles.workoutText}>
            <Text style={styles.workoutName}>{workoutName}</Text>
            {!!workoutMeta && <Text style={styles.workoutMeta}>{workoutMeta}</Text>}
          </View>
        </View>
      )}

      <SectionLabel>{t('schedule.date_label')}</SectionLabel>
      <View style={styles.chipRow}>
        <Chip label={t('common.today')} active={isToday} onPress={() => setRelativeDay(0)} />
        <Chip label={t('common.tomorrow')} active={isTomorrow} onPress={() => setRelativeDay(1)} />
      </View>
      <View style={styles.pickerRow}>
        <TouchableOpacity style={styles.pickerBtn} onPress={() => shiftDay(-1)}>
          <Icon name="chevron-left" size={18} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.pickerValue}>{formatFullDate(date)}</Text>
        <TouchableOpacity style={styles.pickerBtn} onPress={() => shiftDay(1)}>
          <Icon name="chevron-right" size={18} color={colors.onSurface} />
        </TouchableOpacity>
      </View>

      <SectionLabel>{t('schedule.time_label')}</SectionLabel>
      <View style={styles.pickerRow}>
        <TouchableOpacity style={styles.pickerBtn} onPress={() => shiftMinutes(-15)}>
          <Icon name="minus" size={18} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.pickerValue}>{formatTime(date)}</Text>
        <TouchableOpacity style={styles.pickerBtn} onPress={() => shiftMinutes(15)}>
          <Icon name="plus" size={18} color={colors.onSurface} />
        </TouchableOpacity>
      </View>

      <SectionLabel>{t('schedule.repeat_label')}</SectionLabel>
      <View style={styles.chipRow}>
        <Chip
          label={t('schedule.repeat_none')}
          active={!repeatWeekly}
          onPress={() => setRepeatWeekly(false)}
        />
        <Chip
          label={t('schedule.repeat_weekly')}
          active={repeatWeekly}
          onPress={() => setRepeatWeekly(true)}
        />
      </View>

      <View style={styles.toggleWrap}>
        <ToggleRow
          label={t('schedule.remind_label')}
          description={t('schedule.remind_desc')}
          value={remind}
          onChange={setRemind}
          icon="bell"
        />
      </View>

      <PrimaryButton
        label={t('schedule.save')}
        onPress={() =>
          onSubmit({ scheduledDate: date.toISOString(), repeatWeekly, remind })
        }
        loading={isSaving}
      />
    </Modal>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    workoutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      marginBottom: 20,
    },
    workoutIcon: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: colors.electricBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    workoutText: { flex: 1 },
    workoutName: { fontSize: 14, fontWeight: '800', color: colors.onSurface },
    workoutMeta: { fontSize: 11, color: colors.mutedGray, marginTop: 2 },
    chipRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    pickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 10,
      marginBottom: 20,
    },
    pickerBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pickerValue: { fontSize: 15, fontWeight: '800', color: colors.onSurface },
    toggleWrap: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      marginBottom: 20,
    },
  });
