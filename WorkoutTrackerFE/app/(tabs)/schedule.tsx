import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSchedules, useWorkouts } from '../../src/hooks/useFitnessData';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { DashboardSkeleton as Skeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { WorkoutSchedule } from '../../src/types';

export default function ScheduleScreen() {
  const { t } = useTranslation();
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
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-border-gray pb-6 mb-6 flex-wrap gap-4">
          <View>
            <Text className="text-3xl font-black tracking-wider text-on-surface uppercase">
              {t('schedule.title')}
            </Text>
            <Text className="text-muted-gray text-xs tracking-wider uppercase font-semibold mt-1">
              {t('schedule.subtitle')}
            </Text>
          </View>

          <View className="flex-row bg-surface border border-border-gray rounded-lg p-1">
            <TouchableOpacity
              onPress={() => setViewMode('calendar')}
              className={`flex-row items-center gap-1.5 px-4 py-2 rounded-md ${viewMode === 'calendar' ? 'bg-electric' : 'bg-transparent'}`}
            >
              <Feather name="calendar" size={14} color={viewMode === 'calendar' ? 'black' : 'var(--muted-gray)'} />
              <Text className={`text-xs font-bold uppercase tracking-wider ${viewMode === 'calendar' ? 'text-black' : 'text-muted-gray'}`}>
                {t('schedule.calendar_view')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('list')}
              className={`flex-row items-center gap-1.5 px-4 py-2 rounded-md ${viewMode === 'list' ? 'bg-electric' : 'bg-transparent'}`}
            >
              <Feather name="list" size={14} color={viewMode === 'list' ? 'black' : 'var(--muted-gray)'} />
              <Text className={`text-xs font-bold uppercase tracking-wider ${viewMode === 'list' ? 'text-black' : 'text-muted-gray'}`}>
                {t('schedule.list_view')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {viewMode === 'calendar' && (
          <View className="space-y-4">
            <View className="flex-row items-center justify-between bg-card border border-border-gray rounded-xl p-4 shadow-md mb-4">
              <View className="flex-row items-center gap-2">
                <Feather name="calendar" size={20} color="var(--electric)" />
                <Text className="text-xl font-black tracking-widest text-on-surface uppercase">
                  {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity onPress={prevMonth} className="p-2 rounded-lg bg-surface border border-border-gray">
                  <Feather name="chevron-left" size={16} color="var(--muted-gray)" />
                </TouchableOpacity>
                <TouchableOpacity onPress={nextMonth} className="p-2 rounded-lg bg-surface border border-border-gray">
                  <Feather name="chevron-right" size={16} color="var(--muted-gray)" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="bg-card border border-border-gray rounded-xl overflow-hidden shadow-2xl">
              <View className="flex-row border-b border-border-gray bg-surface py-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <Text key={d} className="flex-1 text-center text-xs font-bold uppercase tracking-wider text-muted-gray">
                    {d}
                  </Text>
                ))}
              </View>

              <View className="flex-row flex-wrap bg-background border-l border-t border-border-gray">
                {cells.map((day, idx) => {
                  if (day === null) {
                    return <View key={`empty-${idx}`} className="w-[14.28%] min-h-[100px] bg-card/25 border-r border-b border-border-gray" />;
                  }
                  const daySchedules = getSchedulesForDay(day);
                  const isToday = day.toDateString() === new Date().toDateString();

                  return (
                    <View key={day.toISOString()} className={`w-[14.28%] min-h-[100px] p-2 border-r border-b border-border-gray ${isToday ? 'bg-electric/10 border-t-2 border-t-electric' : ''}`}>
                      <View className="flex-row justify-between items-start mb-1">
                        <Text className={`font-black text-sm tracking-widest ${isToday ? 'text-electric' : 'text-muted-gray'}`}>
                          {day.getDate()}
                        </Text>
                        {daySchedules.length > 0 && <View className="w-2 h-2 rounded-full bg-electric" />}
                      </View>
                      <View className="space-y-1">
                        {daySchedules.slice(0, 2).map((s: WorkoutSchedule) => (
                          <TouchableOpacity
                            key={s.id}
                            onPress={() => handleOpenReschedule(s.id, s.scheduledDate)}
                            className="bg-electric/15 px-1 py-0.5 rounded"
                          >
                            <Text className="text-[8px] font-bold uppercase tracking-wider text-electric" numberOfLines={1}>
                              {s.workoutName}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        {daySchedules.length > 2 && (
                          <Text className="text-[8px] text-muted-gray uppercase font-semibold">
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
          <View className="space-y-4">
            {futureSchedules.length > 0 ? (
              <View className="space-y-4">
                {futureSchedules.map((schedule: WorkoutSchedule) => {
                  const sDate = new Date(schedule.scheduledDate);
                  return (
                    <View key={schedule.id} className="bg-card border border-border-gray rounded-xl p-5 flex-row items-center justify-between shadow-lg mb-4">
                      <View className="flex-row items-center gap-4 flex-1">
                        <View className="w-12 h-12 rounded-lg bg-electric/15 items-center justify-center">
                          <Feather name="clock" size={20} color="var(--electric)" />
                        </View>
                        <View className="flex-1 pr-4">
                          <Text className="font-bold text-on-surface uppercase tracking-wider text-base mb-1" numberOfLines={1}>
                            {schedule.workoutName}
                          </Text>
                          <View className="flex-row items-center gap-2">
                            <Text className="text-xs text-muted-gray font-semibold">
                              {sDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </Text>
                            <Text className="text-xs text-muted-gray">•</Text>
                            <Text className="text-xs text-electric font-bold">
                              {sDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <TouchableOpacity onPress={() => handleOpenReschedule(schedule.id, schedule.scheduledDate)} className="p-2 rounded bg-surface border border-border-gray">
                          <Feather name="edit-2" size={16} color="var(--muted-gray)" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setDeletingId(schedule.id)} className="p-2 rounded bg-surface border border-border-gray">
                          <Feather name="trash-2" size={16} color="var(--error)" />
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
                onAction={() => router.push('/(tabs)/workouts')}
                icon={<Feather name="calendar" size={32} color="var(--muted-gray)" />}
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
        <View className="space-y-4">
          <View className="mb-4">
            <Text className="text-xs font-bold uppercase tracking-wider text-muted-gray mb-2">
              {t('schedule.reschedule_label')} (YYYY-MM-DDTHH:mm)
            </Text>
            <TextInput
              value={newDateInput}
              onChangeText={setNewDateInput}
              placeholder="2026-10-15T14:30"
              placeholderTextColor="var(--muted-gray)"
              className="w-full bg-surface border border-border-gray rounded-lg px-4 py-3 text-sm text-on-surface"
            />
          </View>

          <View className="flex-row justify-end gap-3">
            <TouchableOpacity onPress={() => setReschedulingId(null)} className="rounded-lg px-4 py-3 bg-surface border border-border-gray">
              <Text className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                {t('schedule.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSaveReschedule} className="rounded-lg bg-electric px-6 py-3 flex-row items-center justify-center">
              <Text className="text-black font-black uppercase text-xs">
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
