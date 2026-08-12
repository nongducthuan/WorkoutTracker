import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import { Colors } from '../../theme/colors';
import { styles } from './styles';

interface RestTimerPillProps {
  isActive: boolean;
  secondsLeft: number | null;
  onClose: () => void;
}

export function RestTimerPill({ isActive, secondsLeft, onClose }: RestTimerPillProps) {
  if (!isActive || secondsLeft === null) return null;

  return (
    <View style={styles.timerFloat}>
      <Feather name="clock" size={18} color={Colors.electric} />
      <Text style={styles.timerText}>{secondsLeft}</Text>
      <TouchableOpacity onPress={onClose} style={styles.timerClose}>
        <Feather name="x" size={16} color={Colors.mutedGray} />
      </TouchableOpacity>
    </View>
  );
}
