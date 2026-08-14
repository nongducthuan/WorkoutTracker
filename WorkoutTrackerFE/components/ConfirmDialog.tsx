import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { useTheme } from '../src/context/ThemeContext';
import type { ThemeColors } from '../src/theme/colors';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText,
  cancelText,
  isDanger = true,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(colors);

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>{cancelText || t('common.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmBtn, !isDanger && { backgroundColor: colors.electric }]}
          onPress={onConfirm}
        >
          <Text style={[styles.confirmText, !isDanger && { color: colors.black }]}>
            {confirmText || t('common.confirm')}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    message: { fontSize: 14, color: colors.mutedGray, marginBottom: 24, lineHeight: 21 },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    cancelBtn: {
      paddingHorizontal: 16,
      paddingVertical: 11,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelText: { color: colors.onSurface, fontWeight: '700' },
    confirmBtn: {
      paddingHorizontal: 16,
      paddingVertical: 11,
      borderRadius: 10,
      backgroundColor: colors.error,
    },
    confirmText: { color: '#FFFFFF', fontWeight: '900' },
  });
