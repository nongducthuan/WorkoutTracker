import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { MainTabParamList } from './types';
import { useTheme } from '../context/ThemeContext';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import WorkoutsScreen from '../screens/workouts/WorkoutsScreen';
import ScheduleScreen from '../screens/schedule/ScheduleScreen';
import ExercisesScreen from '../screens/exercises/ExercisesScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={{
        // Every tab screen renders its own title block, exactly as in the
        // design. Keeping the navigator header on produced two stacked titles.
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        tabBarActiveTintColor: colors.electric,
        tabBarInactiveTintColor: colors.mutedGray,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: t('navbar.dashboard_tab', 'Trang chủ'),
          tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Workouts"
        component={WorkoutsScreen}
        options={{
          title: t('navbar.workouts_tab', 'Bài tập'),
          tabBarIcon: ({ color, size }) => <Icon name="list" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          title: t('navbar.schedule_tab', 'Lịch'),
          tabBarIcon: ({ color, size }) => <Icon name="calendar" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Exercises"
        component={ExercisesScreen}
        options={{
          title: t('navbar.exercises_tab', 'Động tác'),
          tabBarIcon: ({ color, size }) => <Icon name="book-open" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: t('navbar.reports_tab', 'Báo cáo'),
          tabBarIcon: ({ color, size }) => <Icon name="pie-chart" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
