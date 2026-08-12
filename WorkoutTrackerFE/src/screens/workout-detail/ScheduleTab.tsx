import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '../../../components/EmptyState';
import { Colors } from '../../theme/colors';
import { styles } from './styles';

interface ScheduleTabProps {
  schedules: any[];
  sortedSchedules: any[];
  onAddSchedule: () => void;
  onDeleteSchedule: (id: string) => void;
}

export function ScheduleTab({ schedules, sortedSchedules, onAddSchedule, onDeleteSchedule }: ScheduleTabProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.paneContent}>
      <View style={styles.paneHeader}>
        <Text style={styles.paneTitle}>
          {t('workout_detail.calendar_split', 'Calendar Split')}
        </Text>
        <TouchableOpacity onPress={onAddSchedule} style={styles.addSchedButton}>
          <Feather name="calendar" size={14} color={Colors.white} />
          <Text style={styles.addSchedText}>
            {t('workout_detail.add_schedule', 'Schedule')}
          </Text>
        </TouchableOpacity>
      </View>

      {schedules.length > 0 ? (
        <View style={styles.cardContainer}>
          {sortedSchedules.map((s: any, index: number) => {
            const isLast = index === sortedSchedules.length - 1;
            const d = new Date(s.scheduledDate);
            return (
              <View key={s.id} style={[styles.schedItem, !isLast && styles.borderBottom]}>
                <View style={styles.schedItemLeft}>
                  <View style={[styles.schedIconBox, s.isCompleted ? styles.schedIconBoxCompleted : styles.schedIconBoxPending]}>
                    {s.isCompleted ? (
                      <Feather name="check" size={16} color={Colors.electric} />
                    ) : (
                      <Feather name="calendar" size={16} color={Colors.mutedGray} />
                    )}
                  </View>
                  <View>
                    <Text style={styles.schedDateText}>
                      {d.toLocaleDateString()}
                    </Text>
                    <Text style={styles.schedTimeText}>
                      {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
                <View style={styles.schedActions}>
                  <TouchableOpacity onPress={() => onDeleteSchedule(s.id)} style={styles.actionBtn}>
                    <Feather name="trash-2" size={14} color={Colors.electricOrange} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <EmptyState
          title="No Schedules"
          description="Schedule this workout to see it in your calendar."
          icon={<Feather name="calendar" size={32} color={Colors.mutedGray} />}
        />
      )}
    </View>
  );
}
