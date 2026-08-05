import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#0B0C0E', // fallback in case var fails in header
          borderBottomWidth: 1,
          borderBottomColor: '#2A2D35',
        },
        headerTitleStyle: {
          color: '#F1F3F5',
        },
        headerTintColor: '#F1F3F5',
        tabBarStyle: {
          backgroundColor: '#141518',
          borderTopWidth: 1,
          borderTopColor: '#2A2D35',
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#C6F432',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('sidebar.dashboard') || 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Feather name="activity" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: t('sidebar.workouts') || 'Workouts',
          tabBarIcon: ({ color, size }) => (
            <Feather name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: t('sidebar.schedule') || 'Schedule',
          tabBarIcon: ({ color, size }) => (
            <Feather name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: t('sidebar.exercises') || 'Exercises',
          tabBarIcon: ({ color, size }) => (
            <Feather name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: t('sidebar.reports') || 'Reports',
          tabBarIcon: ({ color, size }) => (
            <Feather name="pie-chart" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
