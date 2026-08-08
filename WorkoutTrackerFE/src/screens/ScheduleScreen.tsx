import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useSchedules, useWorkouts } from '../hooks/useFitnessData';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { DashboardSkeleton as Skeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { WorkoutSchedule } from '../types';
import { Colors } from '../theme/colors';
import { globalStyles } from '../theme/styles';

export default function ScheduleScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { schedules = [], isLoading: isSchedulesLoading, updateSchedule, deleteSchedule } = useSchedules();
  const { isLoading: isWorkoutsLoading } = useWorkouts();

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDateInput, setNewDateInput] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isLoading = isSchedulesLoading || isWorkoutsLoading;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getSchedulesForDay = (day: Date) => {
    return schedules.filter((s: WorkoutSchedule) => {
      const sDate = new Date(s.scheduledDate);
      return sDate.toDateString() === day.toDateString();
    });
  };

  const handleOpenReschedule = (id: string, currentDateStr: string) => {
    setReschedulingId(id);
    const d = new Date(currentDateStr);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    setNewDateInput(localISOTime);
  };

  const handleSaveReschedule = async () => {
    if (!reschedulingId || !newDateInput) return;
    try {
      await updateSchedule({ id: reschedulingId, date: new Date(newDateInput).toISOString() });
      setReschedulingId(null);
    } catch { }
  };

  const handleConfirmCancel = async () => {
    if (!deletingId) return;
    try {
      await deleteSchedule(deletingId);
      setDeletingId(null);
    } catch { }
  };

  if (isLoading) {
    return <Skeleton />;
  }

  const futureSchedules = schedules.filter((s: WorkoutSchedule) => new Date(s.scheduledDate).getTime() >= Date.now());

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>
              {t('schedule.title')}
            </Text>
            <Text style={styles.headerSubtitle}>
              {t('schedule.subtitle')}
            </Text>
          </View>

          <View style={styles.viewModeContainer}>
            <TouchableOpacity
              onPress={() => setViewMode('calendar')}
              style={[
                styles.viewModeButton,
                viewMode === 'calendar' ? styles.viewModeButtonActive : styles.viewModeButtonInactive
              ]}
            >
              <Feather name="calendar" size={14} color={viewMode === 'calendar' ? 'black' : Colors.mutedGray} />
              <Text style={[
                styles.viewModeText,
                viewMode === 'calendar' ? styles.viewModeTextActive : styles.viewModeTextInactive
              ]}>
                {t('schedule.calendar_view')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('list')}
              style={[
                styles.viewModeButton,
                viewMode === 'list' ? styles.viewModeButtonActive : styles.viewModeButtonInactive
              ]}
            >
              <Feather name="list" size={14} color={viewMode === 'list' ? 'black' : Colors.mutedGray} />
              <Text style={[
                styles.viewModeText,
                viewMode === 'list' ? styles.viewModeTextActive : styles.viewModeTextInactive
              ]}>
                {t('schedule.list_view')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {viewMode === 'calendar' && (
          <View style={styles.viewContent}>
            <View style={styles.calendarHeader}>
              <View style={styles.calendarTitleContainer}>
                <Feather name="calendar" size={20} color={Colors.electric} />
                <Text style={styles.calendarTitle}>
                  {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
              </View>
              <View style={styles.calendarNav}>
                <TouchableOpacity onPress={prevMonth} style={styles.calendarNavButton}>
                  <Feather name="chevron-left" size={16} color={Colors.mutedGray} />
                </TouchableOpacity>
                <TouchableOpacity onPress={nextMonth} style={styles.calendarNavButton}>
                  <Feather name="chevron-right" size={16} color={Colors.mutedGray} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.calendarGrid}>
              <View style={styles.daysHeaderRow}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <Text key={d} style={styles.dayHeaderText}>
                    {d}
                  </Text>
                ))}
              </View>

              <View style={styles.daysGrid}>
                {cells.map((day, idx) => {
                  if (day === null) {
                    return <View key={`empty-${idx}`} style={styles.dayCellEmpty} />;
                  }
                  const daySchedules = getSchedulesForDay(day);
                  const isToday = day.toDateString() === new Date().toDateString();

                  return (
                    <View key={day.toISOString()} style={[styles.dayCell, isToday && styles.dayCellToday]}>
                      <View style={styles.dayCellHeader}>
                        <Text style={[styles.dayCellNumber, isToday ? styles.dayCellNumberToday : styles.dayCellNumberNormal]}>
                          {day.getDate()}
                        </Text>
                        {daySchedules.length > 0 && <View style={styles.dayCellIndicator} />}
                      </View>
                      <View style={styles.scheduleList}>
                        {daySchedules.slice(0, 2).map((s: WorkoutSchedule) => (
                          <TouchableOpacity
                            key={s.id}
                            onPress={() => handleOpenReschedule(s.id, s.scheduledDate)}
                            style={styles.scheduleItemMini}
                          >
                            <Text style={styles.scheduleItemMiniText} numberOfLines={1}>
                              {s.workoutName}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        {daySchedules.length > 2 && (
                          <Text style={styles.moreEventsText}>
                            {t('schedule.more_events', { count: daySchedules.length - 2 })}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {viewMode === 'list' && (
          <View style={styles.viewContent}>
            {futureSchedules.length > 0 ? (
              <View style={styles.listContainer}>
                {futureSchedules.map((schedule: WorkoutSchedule) => {
                  const sDate = new Date(schedule.scheduledDate);
                  return (
                    <View key={schedule.id} style={styles.listItem}>
                      <View style={styles.listMainContent}>
                        <View style={styles.listIconContainer}>
                          <Feather name="clock" size={20} color={Colors.electric} />
                        </View>
                        <View style={styles.listTextContainer}>
                          <Text style={styles.listWorkoutName} numberOfLines={1}>
                            {schedule.workoutName}
                          </Text>
                          <View style={styles.listDateContainer}>
                            <Text style={styles.listDateText}>
                              {sDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </Text>
                            <Text style={styles.listDot}>•</Text>
                            <Text style={styles.listTimeText}>
                              {sDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.listActions}>
                        <TouchableOpacity onPress={() => handleOpenReschedule(schedule.id, schedule.scheduledDate)} style={styles.actionButton}>
                          <Feather name="edit-2" size={16} color={Colors.mutedGray} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setDeletingId(schedule.id)} style={styles.actionButton}>
                          <Feather name="trash-2" size={16} color={Colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <EmptyState
                title={t('schedule.empty_title')}
                description={t('schedule.empty_desc')}
                actionText={t('schedule.empty_action')}
                onAction={() => navigation.navigate('Workouts')} // Ensure navigating to workouts makes sense in CLI
                icon={<Feather name="calendar" size={32} color={Colors.mutedGray} />}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Reschedule Modal */}
      <Modal
        isOpen={reschedulingId !== null}
        onClose={() => setReschedulingId(null)}
        title={t('schedule.reschedule_modal_title')}
      >
        <View style={styles.modalContent}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              {t('schedule.reschedule_label')} (YYYY-MM-DDTHH:mm)
            </Text>
            <TextInput
              value={newDateInput}
              onChangeText={setNewDateInput}
              placeholder="2026-10-15T14:30"
              placeholderTextColor={Colors.mutedGray}
              style={styles.input}
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={() => setReschedulingId(null)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>
                {t('schedule.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSaveReschedule} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>
                {t('schedule.save_schedule')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        isOpen={deletingId !== null}
        title={t('schedule.delete_title')}
        message={t('schedule.delete_message')}
        onConfirm={handleConfirmCancel}
        onCancel={() => setDeletingId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGray,
    paddingBottom: 24,
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1,
    color: Colors.onSurface,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    color: Colors.mutedGray,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginTop: 4,
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 8,
    padding: 4,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewModeButtonActive: {
    backgroundColor: Colors.electric,
  },
  viewModeButtonInactive: {
    backgroundColor: 'transparent',
  },
  viewModeText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  viewModeTextActive: {
    color: 'black',
  },
  viewModeTextInactive: {
    color: Colors.mutedGray,
  },
  viewContent: {
    marginBottom: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    color: Colors.onSurface,
    textTransform: 'uppercase',
  },
  calendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarNavButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderGray,
  },
  calendarGrid: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  daysHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGray,
    backgroundColor: Colors.surface,
    paddingVertical: 12,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.mutedGray,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.background,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: Colors.borderGray,
  },
  dayCellEmpty: {
    width: '14.28%',
    minHeight: 100,
    backgroundColor: 'rgba(30, 30, 30, 0.25)',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderGray,
  },
  dayCell: {
    width: '14.28%',
    minHeight: 100,
    padding: 8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderGray,
  },
  dayCellToday: {
    backgroundColor: 'rgba(219, 255, 0, 0.1)',
    borderTopWidth: 2,
    borderTopColor: Colors.electric,
  },
  dayCellHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  dayCellNumber: {
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 2,
  },
  dayCellNumberToday: {
    color: Colors.electric,
  },
  dayCellNumberNormal: {
    color: Colors.mutedGray,
  },
  dayCellIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.electric,
  },
  scheduleList: {
    gap: 4,
  },
  scheduleItemMini: {
    backgroundColor: 'rgba(219, 255, 0, 0.15)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  scheduleItemMiniText: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.electric,
  },
  moreEventsText: {
    fontSize: 8,
    color: Colors.mutedGray,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  listContainer: {
    gap: 16,
  },
  listItem: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  listMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  listIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(219, 255, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  listWorkoutName: {
    fontWeight: 'bold',
    color: Colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 16,
    marginBottom: 4,
  },
  listDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listDateText: {
    fontSize: 12,
    color: Colors.mutedGray,
    fontWeight: '600',
  },
  listDot: {
    fontSize: 12,
    color: Colors.mutedGray,
  },
  listTimeText: {
    fontSize: 12,
    color: Colors.electric,
    fontWeight: 'bold',
  },
  listActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderGray,
  },
  modalContent: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.mutedGray,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.onSurface,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderGray,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  saveButton: {
    borderRadius: 8,
    backgroundColor: Colors.electric,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'black',
    fontWeight: '900',
    textTransform: 'uppercase',
    fontSize: 12,
  }
});
