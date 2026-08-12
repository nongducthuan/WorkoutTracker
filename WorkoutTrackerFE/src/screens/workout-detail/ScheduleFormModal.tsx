import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Controller, Control } from 'react-hook-form';

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
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Split">
      <View style={styles.modalContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Date & Time</Text>
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
          <Text style={styles.modalSaveText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
