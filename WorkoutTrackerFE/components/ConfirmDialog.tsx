import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Modal as RNModal } from 'react-native';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  confirmText?: string;
  isDanger?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading,
  confirmText = 'Delete',
  isDanger = true,
}) => {
  return (
    <RNModal visible={isOpen} transparent={true} animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 justify-center bg-black/70 p-4">
        <View className="bg-card border border-border-gray rounded-xl p-6 shadow-xl w-full">
          <Text className="text-xl font-bold text-on-surface mb-2">{title}</Text>
          <Text className="text-muted-gray mb-6">{message}</Text>
          
          <View className="flex-row justify-end gap-3">
            <TouchableOpacity 
              onPress={onCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-surface rounded-lg"
            >
              <Text className="text-on-surface font-bold">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 ${isDanger ? 'bg-error' : 'bg-electric'} rounded-lg flex-row items-center justify-center min-w-[80px]`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-bold">{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </RNModal>
  );
};
