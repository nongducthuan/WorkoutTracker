import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../../components/Modal';
import {
  PrimaryButton,
  SearchInput,
  SectionLabel,
  Stepper,
  Chip,
} from '../../../../components/ui';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { useSettings } from '../../../context/SettingsContext';
import { Exercise, WorkoutExercise } from '../../../types';
import { categoryLabel } from '../../../lib/categoryLabels';
import {
  prescriptionFor,
  goalLabelKey,
  levelLabelKey,
} from '../../../lib/trainingPrescription';
import {
  exerciseVolume,
  formatNumber,
  toDisplayWeight,
  toStorageWeight,
} from '../../../utils/format';

export interface ExerciseFormValues {
  exerciseId: number;
  sets: number;
  repetitions: number;
  /** Always stored in kg. */
  weight: number;
  restSeconds: number;
}

interface ExerciseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ExerciseFormValues) => Promise<void> | void;
  library: Exercise[];
  editing?: WorkoutExercise | null;
  isSaving?: boolean;
  /** Pre-selects an exercise when opened from the exercise detail screen. */
  presetExerciseId?: number;
}

const BASE_REST_OPTIONS = [30, 45, 60, 90, 120];

/** Design 04e · Thêm bài vào giáo án. */
export const ExerciseFormModal: React.FC<ExerciseFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  library,
  editing,
  isSaving,
  presetExerciseId,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const styles = makeStyles(colors);

  /**
   * What the onboarding answers (01e) are for: a new exercise opens on a set
   * and rep scheme that matches the user's goal and level instead of a fixed
   * 4 × 8. Editing an existing exercise must never be touched by this — those
   * numbers are the user's own.
   */
  const prescription = useMemo(
    () => prescriptionFor(settings.goal, settings.level),
    [settings.goal, settings.level]
  );

  const [exerciseId, setExerciseId] = useState<number>(0);
  const [isPicking, setIsPicking] = useState(false);
  const [search, setSearch] = useState('');
  const [sets, setSets] = useState(prescription.sets);
  const [reps, setReps] = useState(prescription.reps);
  /** Held in the user's display unit; converted back to kg on submit. */
  const [weight, setWeight] = useState(20);
  const [restSeconds, setRestSeconds] = useState(prescription.restSeconds);

  useEffect(() => {
    if (!isOpen) return;
    const initialId = editing?.exerciseId ?? presetExerciseId ?? library[0]?.id ?? 0;
    setExerciseId(initialId);
    setSets(editing?.sets ?? prescription.sets);
    setReps(editing?.repetitions ?? prescription.reps);
    setWeight(
      Math.round(toDisplayWeight(editing?.weight ?? 20, settings.weightUnit) * 2) / 2
    );
    // The general rest setting (08d) still wins when the user has moved it off
    // the default; otherwise the goal decides.
    setRestSeconds(editing ? settings.restSeconds : prescription.restSeconds);
    setIsPicking(!initialId);
    setSearch('');
  }, [isOpen, editing, presetExerciseId, library, settings.weightUnit, settings.restSeconds, prescription]);

  const restOptions = useMemo(
    () =>
      Array.from(new Set([...BASE_REST_OPTIONS, prescription.restSeconds])).sort(
        (a, b) => a - b
      ),
    [prescription.restSeconds]
  );

  const selected = library.find((e) => e.id === exerciseId);

  const filtered = useMemo(
    () =>
      library.filter((e) =>
        search.trim() ? e.name.toLowerCase().includes(search.trim().toLowerCase()) : true
      ),
    [library, search]
  );

  const expectedVolume = exerciseVolume(sets, reps, toStorageWeight(weight, settings.weightUnit));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="sheet"
      scrollable
      title={editing ? t('workout_detail.edit_movement') : t('workout_detail.add_movement')}
    >
      {isPicking ? (
        <View>
          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder={t('exercises.search_placeholder')}
          />
          <ScrollView style={styles.picker} nestedScrollEnabled>
            {filtered.map((e) => (
              <TouchableOpacity
                key={e.id}
                style={styles.pickerRow}
                onPress={() => {
                  setExerciseId(e.id);
                  setIsPicking(false);
                }}
              >
                <View style={styles.pickerText}>
                  <Text style={styles.pickerName}>{e.name}</Text>
                  <Text style={styles.pickerMeta}>{categoryLabel(e.category)}</Text>
                </View>
                {exerciseId === e.id && (
                  <Icon name="check" size={16} color={colors.electric} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : (
        <>
          <View style={styles.selectedRow}>
            <View style={styles.selectedIcon}>
              <Icon name="activity" size={18} color={colors.electric} />
            </View>
            <View style={styles.pickerText}>
              <Text style={styles.pickerName}>
                {selected?.name || t('exercise_form.pick_exercise')}
              </Text>
              <Text style={styles.pickerMeta}>{categoryLabel(selected?.category)}</Text>
            </View>
            <TouchableOpacity onPress={() => setIsPicking(true)}>
              <Text style={styles.changeText}>{t('common.change')}</Text>
            </TouchableOpacity>
          </View>

          {!editing && (
            <Text style={styles.prescription}>
              {t('exercise_form.prescription_hint', {
                goal: t(goalLabelKey(settings.goal)),
                level: t(levelLabelKey(settings.level)),
                sets: prescription.sets,
                reps: prescription.reps,
                rest: prescription.restSeconds,
              })}
            </Text>
          )}

          <Stepper
            label={t('exercise_form.sets_label')}
            value={sets}
            onChange={setSets}
            min={1}
            max={12}
          />
          <Stepper
            label={t('exercise_form.reps_label')}
            value={reps}
            onChange={setReps}
            min={1}
            max={50}
          />
          <Stepper
            label={t('exercise_form.weight_label', { unit: settings.weightUnit })}
            value={weight}
            onChange={setWeight}
            min={0}
            max={500}
            step={2.5}
          />

          <SectionLabel>{t('exercise_form.rest_label')}</SectionLabel>
          <View style={styles.restRow}>
            {restOptions.map((s) => (
              <Chip
                key={s}
                label={`${s}s`}
                active={restSeconds === s}
                onPress={() => setRestSeconds(s)}
              />
            ))}
          </View>

          <View style={styles.volumeRow}>
            <Text style={styles.volumeLabel}>{t('exercise_form.expected_volume')}</Text>
            <Text style={styles.volumeValue}>
              {formatNumber(expectedVolume)} {settings.weightUnit === 'lb' ? 'lb' : 'kg'}
            </Text>
          </View>

          <PrimaryButton
            label={t('exercise_form.save')}
            onPress={() =>
              onSubmit({
                exerciseId,
                sets,
                repetitions: reps,
                weight: toStorageWeight(weight, settings.weightUnit),
                restSeconds,
              })
            }
            disabled={!exerciseId || isSaving}
            loading={isSaving}
          />
        </>
      )}
    </Modal>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    picker: { maxHeight: 320, marginTop: 8 },
    pickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    pickerText: { flex: 1 },
    pickerName: { fontSize: 14, fontWeight: '800', color: colors.onSurface },
    pickerMeta: { fontSize: 11, color: colors.mutedGray, marginTop: 2 },
    selectedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      marginBottom: 18,
    },
    selectedIcon: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: colors.electricBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    changeText: {
      fontSize: 12,
      fontWeight: '900',
      color: colors.electric,
      textTransform: 'uppercase',
    },
    prescription: {
      fontSize: 11,
      lineHeight: 16,
      color: colors.mutedGray,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 10,
      marginBottom: 16,
    },
    restRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
    volumeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginBottom: 18,
    },
    volumeLabel: { fontSize: 12, color: colors.mutedGray, fontWeight: '700' },
    volumeValue: { fontSize: 16, fontWeight: '900', color: colors.electric },
  });
