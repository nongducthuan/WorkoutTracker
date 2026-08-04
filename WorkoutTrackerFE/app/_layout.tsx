// @ts-ignore
import '../global.css';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { authApi } from '../src/api/auth';
import '../src/i18n';
import { router } from 'expo-router';
import { ToastProvider } from '../components/Toast';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    async function checkAuth() {
      try {
        const isAuth = await authApi.isAuthenticated();
        // Delay navigation until layout is mounted
        setTimeout(() => {
          if (!isAuth) {
            router.replace('/(auth)/login');
          }
        }, 100);
      } catch (e) {
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 100);
      } finally {
        setIsAuthChecking(false);
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (loaded && !isAuthChecking) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isAuthChecking]);

  if (!loaded || isAuthChecking) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RootLayoutNav />
      </ToastProvider>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="workouts/[id]" options={{ presentation: 'card', headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
