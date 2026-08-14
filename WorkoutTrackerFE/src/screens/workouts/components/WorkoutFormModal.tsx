import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../../components/Modal';
import { FormField, PrimaryButton, Chip, SectionLabel } from '../../../../components/ui';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { Workout } from '../../../types';
import { categoryLabel } from '../../../lib/categoryLabels';

export interface WorkoutFormValues {
  name: string;
  description: string;
  muscles: string[];
}

interface WorkoutFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: WorkoutFormValues) => Promise<void> | void;
  /** Categories offered as "Nhóm cơ chính" chips. */
  muscleOptions: string[];
  editing?: Workout | null;
  isSaving?: boolean;
}

/**
 * Design 04f · Tạo giáo án mới. Also reused for editing an existing routine.
 * Muscle groups are stored inside the description because the API has no
 * dedicated column; they are rendered back as tags on the workout card.
 */
export const WorkoutFormModal: React.FC<WorkoutFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  muscleOptions,
  editing,
  isSaving,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(colors);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [muscles, setMuscles] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setName(editing?.name ?? '');
    setDescription(editing?.description ?? '');
    setMuscles([]);
  }, [isOpen, editing]);

  const toggleMuscle = (muscle: string) =>
    setMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );

  const canSubmit = name.trim().length > 0 && !isSaving;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="sheet"
      scrollable
      title={editing ? t('workouts.modal_edit_title') : t('workouts.modal_create_title')}
    >
      <FormField
        label={t('workouts.name_label')}
        value={name}
        onChangeText={setName}
        placeholder="Push Day B"
        hint={t('workouts.name_placeholder_hint')}
      />

      <FormField
        label={t('workouts.desc_label')}
        value={description}
        onChangeText={setDescription}
        placeholder={t('workouts.desc_hint')}
        multiline
        numberOfLines={3}
        style={styles.textArea}
      />

      <SectionLabel>{t('workouts.muscles_label')}</SectionLabel>
      <View style={styles.chipRow}>
        {muscleOptions.map((m) => (
          <Chip
            key={m}
            label={categoryLabel(m)}
            active={muscles.includes(m)}
            onPress={() => toggleMuscle(m)}
          />
        ))}
      </View>

      <Text style={styles.hint}>{t('workouts.schedule_now_hint')}</Text>

      <PrimaryButton
        label={editing ? t('workouts.save_workout') : t('workouts.create_workout')}
        onPress={() => onSubmit({ name: name.trim(), description: description.trim(), muscles })}
        disabled={!canSubmit}
        loading={isSaving}
        style={styles.submit}
      />
    </Modal>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    textArea: { minHeight: 84, textAlignVertical: 'top' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
    hint: { fontSize: 11, color: colors.mutedGray, marginBottom: 18 },
    submit: { marginTop: 4 },
  });
