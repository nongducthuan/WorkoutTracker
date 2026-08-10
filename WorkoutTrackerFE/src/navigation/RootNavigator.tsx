import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { setNavigateToLogin } from '../api/client';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import WorkoutDetailScreen from '../screens/WorkoutDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import WeeklyGoalScreen from '../screens/WeeklyGoalScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import OnboardingGoalScreen from '../screens/OnboardingGoalScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import AboutScreen from '../screens/AboutScreen';

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
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="WeeklyGoal"
        component={WeeklyGoalScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="OnboardingGoal"
        component={OnboardingGoalScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ presentation: 'card' }}
      />
    </Stack.Navigator>
  );
}