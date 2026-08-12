import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Controller, Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Modal } from '../../../components/Modal';
import { Colors } from '../../theme/colors';
import { styles } from './styles';

interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  control: Control<any>;
  onSubmit: () => void;
}

export function ScheduleFormModal({ isOpen, onClose, control, onSubmit }: ScheduleFormModalProps) {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('workout_detail.schedule_modal_title')}>
      <View style={styles.modalContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('schedule.reschedule_label')}</Text>
          <Controller
            control={control}
            name="scheduledDate"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="YYYY-MM-DDTHH:mm"
                placeholderTextColor={Colors.mutedGray}
                style={styles.modalTextInputBox}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>
        <TouchableOpacity onPress={onSubmit} style={styles.modalSaveBtn}>
          <Text style={styles.modalSaveText}>{t('common.confirm')}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
