import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { Colors } from '../../theme/colors';
import { styles } from './styles';

export type WorkoutDetailTabId = 'exercises' | 'comments' | 'schedule';

interface TabsBarProps {
  activeTab: WorkoutDetailTabId;
  onChangeTab: (tab: WorkoutDetailTabId) => void;
}

export function TabsBar({ activeTab, onChangeTab }: TabsBarProps) {
  const { t } = useTranslation();

  const tabs: { id: WorkoutDetailTabId; label: string; icon: string }[] = [
    { id: 'exercises', label: t('workout_detail.tab_exercises', 'Exercise Logs'), icon: 'list' },
    { id: 'comments', label: t('workout_detail.tab_comments', 'Board Comments'), icon: 'message-square' },
    { id: 'schedule', label: t('workout_detail.tab_schedule', 'Calendar Split'), icon: 'calendar' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tabsContainer}
      contentContainerStyle={styles.tabsContent}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => onChangeTab(tab.id)}
          style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
        >
          <Feather
            name={tab.icon}
            size={16}
            color={activeTab === tab.id ? Colors.electric : Colors.mutedGray}
          />
          <Text style={[styles.tabText, activeTab === tab.id ? styles.tabTextActive : styles.tabTextInactive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}