import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';

export const EmptyState = ({ title, description, actionText, onAction, icon }: any) => (
  <View className="items-center justify-center py-10 bg-card rounded-xl border border-border-gray">
    {icon}
    <Text className="text-white font-bold mt-4 text-lg">{title}</Text>
    <Text className="text-muted-gray text-center mt-2 px-6 text-sm">{description}</Text>
    {actionText && onAction && (
      <TouchableOpacity onPress={onAction} className="bg-electric px-6 py-3 rounded-lg mt-6">
        <Text className="text-black font-bold uppercase">{actionText}</Text>
      </TouchableOpacity>
    )}
  </View>
);
