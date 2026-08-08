import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../src/theme/colors';

export const MuscleMap = ({ data }: any) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Muscle Map Visualization (Placeholder)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    backgroundColor: Colors.card,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  text: {
    color: Colors.mutedGray,
  },
});
