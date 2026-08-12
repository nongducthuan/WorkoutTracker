import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Controller, Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Modal } from '../../../components/Modal';
import { Colors } from '../../theme/colors';
import { styles } from './styles';

interface ExerciseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  control: Control<any>;
  onSubmit: () => void;
  submitStatus: 'idle' | 'loading' | 'success' | 'error';
}

export function ExerciseFormModal({ isOpen, onClose, isEditing, control, onSubmit, submitStatus }: ExerciseFormModalProps) {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? t('workout_detail.edit_movement') : t('workout_detail.add_movement')}>
      <View style={styles.modalContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('workout_detail.exercise_library')}</Text>
          <Controller
            control={control}
            name="exerciseId"
            render={({ field: { onChange, value } }) => (
              <View style={styles.modalInputWrap}>
                <View style={styles.fakePickerRow}>
                  <Text style={styles.fakePickerText}>Select Exercise ID: {value}</Text>
                  <Feather name="chevron-down" size={16} color={Colors.white} />
                </View>
                <TextInput
                  keyboardType="numeric"
                  placeholder="Type Exercise ID (1-10)"
                  placeholderTextColor={Colors.mutedGray}
                  style={styles.modalTextInput}
                  value={String(value || '')}
                  onChangeText={(v) => onChange(Number(v))}
                />
              </View>
            )}
          />
        </View>

        <View style={styles.rowGap4}>
          <View style={styles.flex1}>
            <Text style={styles.inputLabel}>{t('workout_detail.sets')}</Text>
            <Controller
              control={control}
              name="sets"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  keyboardType="numeric"
                  style={styles.modalTextInputBox}
                  value={String(value)}
                  onChangeText={(v) => onChange(Number(v))}
                />
              )}
            />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.inputLabel}>{t('workout_detail.reps')}</Text>
            <Controller
              control={control}
              name="repetitions"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  keyboardType="numeric"
                  style={styles.modalTextInputBox}
                  value={String(value)}
                  onChangeText={(v) => onChange(Number(v))}
                />
              )}
            />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.inputLabel}>{t('workout_detail.weight')}</Text>
            <Controller
              control={control}
              name="weight"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  keyboardType="numeric"
                  style={styles.modalTextInputBox}
                  value={String(value)}
                  onChangeText={(v) => onChange(Number(v))}
                />
              )}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={onSubmit}
          disabled={submitStatus === 'loading'}
          style={styles.modalSaveBtn}
        >
          <Text style={styles.modalSaveText}>
            {submitStatus === 'loading' ? t('profile.saving') : t('workout_detail.save_movement')}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
