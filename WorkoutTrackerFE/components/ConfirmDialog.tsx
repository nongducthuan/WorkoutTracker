import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Modal } from './Modal';
import { Colors } from '../src/theme/colors';

export const ConfirmDialog = ({ isOpen, title, message, onCancel, onConfirm }: any) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
          <Text style={styles.confirmText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  message: { fontSize: 16, color: Colors.text, marginBottom: 24, lineHeight: 22 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  cancelText: { color: Colors.text, fontWeight: 'bold' },
  confirmBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: Colors.error },
  confirmText: { color: '#ffffff', fontWeight: 'bold' },
});
