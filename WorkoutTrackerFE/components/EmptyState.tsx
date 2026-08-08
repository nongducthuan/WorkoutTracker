import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../src/theme/colors';

export const EmptyState = ({ title, description, actionText, onAction, icon }: any) => {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionText && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  iconContainer: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 8, textAlign: 'center' },
  description: { fontSize: 16, color: Colors.mutedGray, textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: Colors.black, fontWeight: 'bold', fontSize: 16 },
});
