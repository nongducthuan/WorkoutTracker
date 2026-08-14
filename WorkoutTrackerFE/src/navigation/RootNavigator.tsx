import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { setNavigateToLogin } from '../api/client';
import { useSettings } from '../context/SettingsContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

import WorkoutDetailScreen from '../screens/workout-detail/WorkoutDetailScreen';
import ActiveWorkoutScreen from '../screens/active-workout/ActiveWorkoutScreen';
import WorkoutSummaryScreen from '../screens/active-workout/WorkoutSummaryScreen';
import ExerciseDetailScreen from '../screens/exercises/ExerciseDetailScreen';
import ExerciseHistoryScreen from '../screens/exercises/ExerciseHistoryScreen';
import MuscleMapFullScreen from '../screens/reports/MuscleMapFullScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import WeeklyGoalScreen from '../screens/profile/WeeklyGoalScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import OnboardingGoalScreen from '../screens/auth/OnboardingGoalScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AboutScreen from '../screens/profile/AboutScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  isAuthenticated: boolean;
  navigationRef: NavigationContainerRefWithCurrent<any>;
}

export default function RootNavigator({ isAuthenticated, navigationRef }: RootNavigatorProps) {
  const { settings, isServerSynced } = useSettings();

  useEffect(() => {
    setNavigateToLogin(() => {
      navigationRef.current?.reset({ index: 0, routes: [{ name: 'Auth' }] });
    });
  }, [navigationRef]);

  /**
   * Onboarding (01e) used to be reachable only from the register screen, so an
   * account that signed in on a second device — or quit halfway through — never
   * saw it again while `onboardingCompleted` stayed false forever.
   *
   * The check keys off the flag on the account, not off the navigation history,
   * and only fires once the server copy has actually arrived: redirecting on
   * the local default would push every offline user into onboarding. It waits
   * for the user to be on `Main`, which is where both signing in and reopening
   * the app land.
   */
  useEffect(() => {
    if (!isServerSynced || settings.onboardingCompleted) return;
    // The root stack, not `getCurrentRoute()` — that one returns the focused
    // *tab* ("Home", "Lịch"…) once MainTabs is mounted, never "Main".
    const rootState = navigationRef.current?.getRootState();
    const rootRoute = rootState?.routes?.[rootState.index ?? 0]?.name;
    if (rootRoute !== 'Main') return;
    navigationRef.current?.reset({ index: 0, routes: [{ name: 'OnboardingGoal' }] });
  }, [isServerSynced, settings.onboardingCompleted, navigationRef]);

  return (
    <Stack.Navigator
      id="RootNavigator"
      screenOptions={{ headerShown: false }}
      initialRouteName={isAuthenticated ? 'Main' : 'Auth'}
    >
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="Main" component={MainTabs} />

      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
      <Stack.Screen
        name="ActiveWorkout"
        component={ActiveWorkoutScreen}
        options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
      />
      <Stack.Screen
        name="WorkoutSummary"
        component={WorkoutSummaryScreen}
        options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
      />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <Stack.Screen name="ExerciseHistory" component={ExerciseHistoryScreen} />

      <Stack.Screen name="MuscleMapFull" component={MuscleMapFullScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />

      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="WeeklyGoal" component={WeeklyGoalScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="OnboardingGoal" component={OnboardingGoalScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}
