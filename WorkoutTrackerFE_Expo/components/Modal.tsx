import React from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <RNModal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center bg-black/70 p-4">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'position'}>
            <View className="bg-card border border-border-gray rounded-xl p-6 shadow-xl w-full">
              <View className="flex-row items-center justify-between mb-4 border-b border-border-gray pb-4">
                <Text className="text-xl font-bold text-on-surface uppercase tracking-wider">{title}</Text>
                <TouchableOpacity onPress={onClose} className="p-2 rounded-full bg-surface">
                  <Feather name="x" size={20} color="var(--on-surface)" />
                </TouchableOpacity>
              </View>
              {children}
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};
