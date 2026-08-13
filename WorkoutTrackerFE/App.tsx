import React, { useEffect, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { authApi } from './src/api/auth';
import { ToastProvider } from './components/Toast';
import { Colors } from './src/theme/colors';
import { DashboardSkeleton } from './components/LoadingSkeleton';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import './src/i18n';

const queryClient = new QueryClient();
export const navigationRef = createNavigationContainerRef<any>();

function AppContent({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
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
    const checkAuth = async () => {
      const isAuth = await authApi.isAuthenticated();
      setIsAuthenticated(isAuth);
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <DashboardSkeleton />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent isAuthenticated={isAuthenticated} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
