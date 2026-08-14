import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';

/** Full-screen loading state; theme-aware so it doesn't flash dark in light mode. */
export const DashboardSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.electric} />
    </View>
  );
};

/** Inline spinner for sections inside an already-rendered screen. */
export const InlineLoader = () => {
  const { colors } = useTheme();
  return (
    <View style={styles.inline}>
      <ActivityIndicator color={colors.electric} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  inline: { paddingVertical: 32, alignItems: 'center' },
});
