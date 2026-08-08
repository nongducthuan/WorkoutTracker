import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { setNavigateToLogin } from '../api/client';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import WorkoutDetailScreen from '../screens/WorkoutDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  isAuthenticated: boolean;
  navigationRef: NavigationContainerRefWithCurrent<any>;
}

export default function RootNavigator({ isAuthenticated, navigationRef }: RootNavigatorProps) {
  useEffect(() => {
    setNavigateToLogin(() => {
      navigationRef.current?.reset({ index: 0, routes: [{ name: 'Auth' }] });
    });
  }, [navigationRef]);

  return (
    <Stack.Navigator
      id="RootNavigator"
      screenOptions={{ headerShown: false }}
      initialRouteName={isAuthenticated ? 'Main' : 'Auth'}
    >
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="WorkoutDetail"
        component={WorkoutDetailScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
