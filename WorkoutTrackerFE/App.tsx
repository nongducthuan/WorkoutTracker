import React, { useEffect, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RootNavigator from './src/navigation/RootNavigator';
import { authApi } from './src/api/auth';
import { onSessionChange } from './src/api/client';
import { STORAGE_KEYS } from './src/constants/storage';
import { ToastProvider } from './components/Toast';
import { DashboardSkeleton } from './components/LoadingSkeleton';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { loadSavedLanguage } from './src/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

/**
 * Storage that belongs to the signed-in account, not to the phone. Theme and
 * language are deliberately absent: they are device preferences and should
 * survive a logout so the login screen does not flip back to Vietnamese dark.
 *
 * Active-workout drafts are keyed `pulse_active_workout_<workoutId>`, so they
 * are matched by prefix rather than listed.
 */
const ACCOUNT_STORAGE_KEYS = [
  STORAGE_KEYS.notificationsRead,
  STORAGE_KEYS.completedSets,
  STORAGE_KEYS.weeklyGoal,
  STORAGE_KEYS.onboarding,
];

const purgeAccountStorage = async () => {
  try {
    const all = await AsyncStorage.getAllKeys();
    const stale = all.filter(
      (key) =>
        ACCOUNT_STORAGE_KEYS.includes(key as (typeof ACCOUNT_STORAGE_KEYS)[number]) ||
        key.startsWith(STORAGE_KEYS.activeWorkout)
    );
    if (stale.length) await AsyncStorage.multiRemove(stale);
  } catch {
    // best effort — the query cache is the leak that actually shows on screen
  }
};

// Registered at module scope so a remount of <App /> cannot subscribe twice.
onSessionChange(async (event) => {
  if (event !== 'signed-out') return;
  // Synchronous, so nothing can read the previous account's rows after this.
  queryClient.clear();
  await purgeAccountStorage();
});

export const navigationRef = createNavigationContainerRef<any>();

function AppContent({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <ToastProvider>
        <NavigationContainer ref={navigationRef}>
          <RootNavigator isAuthenticated={isAuthenticated} navigationRef={navigationRef} />
        </NavigationContainer>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      // Language must be restored before the first render so screens do not
      // flash English copy on a Vietnamese install.
      await loadSavedLanguage();
      setIsAuthenticated(await authApi.isAuthenticated());
    })();
  }, []);

  if (isAuthenticated === null) {
    return (
      <ThemeProvider>
        <DashboardSkeleton />
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {/* SettingsProvider is outermost: ThemeProvider reads the account's theme
          from it, and the settings context works without a theme. */}
      <SettingsProvider>
        <ThemeProvider>
          <AppContent isAuthenticated={isAuthenticated} />
        </ThemeProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
