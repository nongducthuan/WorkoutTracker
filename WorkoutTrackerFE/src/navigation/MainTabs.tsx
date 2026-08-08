import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import { MainTabParamList } from './types';
import { Colors } from '../theme/colors';
import DashboardScreen from '../screens/DashboardScreen';
import WorkoutsScreen from '../screens/WorkoutsScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import ExercisesScreen from '../screens/ExercisesScreen';
import ReportsScreen from '../screens/ReportsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const headerStyle = {
  backgroundColor: Colors.background,
  borderBottomWidth: 1,
  borderBottomColor: Colors.border,
  elevation: 0,
  shadowOpacity: 0,
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={{
        headerShown: true,
        headerStyle,
        headerTitleStyle: { color: Colors.onSurface },
        headerTintColor: Colors.onSurface,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.electric,
        tabBarInactiveTintColor: Colors.mutedGray,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Icon name="activity" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Workouts"
        component={WorkoutsScreen}
        options={{
          title: 'Workouts',
          tabBarIcon: ({ color, size }) => <Icon name="list" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, size }) => <Icon name="calendar" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Exercises"
        component={ExercisesScreen}
        options={{
          title: 'Exercises',
          tabBarIcon: ({ color, size }) => <Icon name="book" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => <Icon name="pie-chart" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
