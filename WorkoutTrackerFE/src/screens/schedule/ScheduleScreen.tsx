import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { useSchedules, useWorkouts, useWorkoutSummaries } from '../../hooks';
import { DashboardSkeleton } from '../../../components/LoadingSkeleton';
import { ErrorState } from '../../../components/ErrorState';
import { EmptyState } from '../../../components/EmptyState';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { Modal } from '../../../components/Modal';
import { SegmentedControl } from '../../../components/ui';
import {
  isSameDay,
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfDay,
  formatShortDate,
} from '../../utils/date';
import { WorkoutSchedule } from '../../types';

import { CalendarGrid } from './components/CalendarGrid';
import { UpcomingList } from './components/UpcomingList';
import {
  ScheduleFormModal,
  ScheduleFormValues,
} from '../workout-detail/components/ScheduleFormModal';

type ScheduleNav = NativeStackNavigationProp<RootStackParamList>;
type ViewMode = 'calendar' | 'list';

/** How far back the list view reaches. Older sessions live in Báo cáo (07). */
const LIST_HISTORY_MONTHS = 3;
/**
 * Months loaded around the month on screen. One behind covers stepping back;
 * three ahead keeps the "sắp tới" fallback list populated for someone who plans
 * a season in advance.
 */
const CALENDAR_MONTHS_BEHIND = 1;
const CALENDAR_MONTHS_AHEAD = 3;

/** Design 06 · Lịch tập. */
export default function ScheduleScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<ScheduleNav>();

  const [mode, setMode] = useState<ViewMode>('calendar');
  const [month, setMonth] = useState(() => new Date());

  /**
   * The screen used to pull every schedule the account had ever created and
   * filter on the device. It now asks for the window it actually draws: the
   * months around the calendar, or the recent history the list shows.
   */
  const listFrom = useMemo(
    () => startOfDay(addMonths(new Date(), -LIST_HISTORY_MONTHS)),
    []
  );

  const range = useMemo(
    () =>
      mode === 'list'
        ? // No upper bound: a schedule the user planned far ahead must never
          // vanish from the list that is supposed to show what is coming.
          { from: listFrom.toISOString() }
        : {
            from: startOfMonth(addMonths(month, -CALENDAR_MONTHS_BEHIND)).toISOString(),
            to: endOfMonth(addMonths(month, CALENDAR_MONTHS_AHEAD)).toISOString(),
          },
    [mode, month, listFrom]
  );

  const {
    schedules,
    isLoading,
    isError,
    refetch,
    scheduleWorkout,
    deleteSchedule,
    completeSchedule,
    isScheduling,
  } = useSchedules(range);
  const { workouts } = useWorkouts();
  const { summaries } = useWorkoutSummaries();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [formWorkoutId, setFormWorkoutId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<WorkoutSchedule | null>(null);

  const sorted = useMemo(
    () =>
      [...schedules].sort(
        (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      ),
    [schedules]
  );

  const upcoming = useMemo(
    () => sorted.filter((s) => !s.isCompleted && new Date(s.scheduledDate) >= new Date()),
    [sorted]
  );

  const daySchedules = useMemo(
    () => (selectedDate ? sorted.filter((s) => isSameDay(s.scheduledDate, selectedDate)) : []),
    [sorted, selectedDate]
  );

  const selectedWorkout = workouts.find((w) => w.id === formWorkoutId);

  const handleSubmit = async (values: ScheduleFormValues) => {
    if (!formWorkoutId) return;
    await scheduleWorkout({
      scheduledDate: values.scheduledDate,
      workoutId: formWorkoutId,
      isCompleted: false,
      remindEnabled: values.remind,
    });
    if (values.repeatWeekly) {
      for (let week = 1; week <= 3; week += 1) {
        const next = new Date(values.scheduledDate);
        next.setDate(next.getDate() + week * 7);
        await scheduleWorkout({
          scheduledDate: next.toISOString(),
          workoutId: formWorkoutId,
          isCompleted: false,
          remindEnabled: values.remind,
        });
      }
    }
    setFormWorkoutId(null);
  };

  const styles = makeStyles(colors);

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{t('schedule.title')}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setPickerOpen(true)}
          >
            <Icon name="plus" size={20} color={colors.black} />
          </TouchableOpacity>
        </View>

        <SegmentedControl<ViewMode>
          value={mode}
          onChange={setMode}
          style={styles.modeSwitch}
          options={[
            { value: 'calendar', label: t('schedule.calendar_view'), icon: 'calendar' },
            { value: 'list', label: t('schedule.list_view'), icon: 'list' },
          ]}
        />

        {schedules.length === 0 ? (
          <EmptyState
            iconName="calendar"
            title={t('schedule.empty_title')}
            description={t('schedule.empty_desc')}
            actionText={t('schedule.empty_action')}
            onAction={() => setPickerOpen(true)}
          />
        ) : mode === 'calendar' ? (
          <>
            <CalendarGrid
              month={month}
              schedules={sorted}
              selectedDate={selectedDate}
              onChangeMonth={setMonth}
              onSelectDate={setSelectedDate}
            />
            <UpcomingList
              schedules={daySchedules.length ? daySchedules : upcoming.slice(0, 5)}
              onPress={(s) => navigation.navigate('WorkoutDetail', { id: s.workoutId })}
              onComplete={(s) => completeSchedule(s.id)}
              onDelete={setPendingDelete}
            />
          </>
        ) : (
          <>
            <UpcomingList
              schedules={sorted}
              onPress={(s) => navigation.navigate('WorkoutDetail', { id: s.workoutId })}
              onComplete={(s) => completeSchedule(s.id)}
              onDelete={setPendingDelete}
            />
            <Text style={styles.rangeNote}>
              {t('schedule.history_note', { date: formatShortDate(listFrom) })}
            </Text>
          </>
        )}
      </ScrollView>

      {/* Step 1 — choose which routine to schedule. */}
      <Modal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title={t('schedule.form_title')}
        variant="sheet"
        scrollable
      >
        {workouts.length === 0 ? (
          <View style={styles.pickerEmpty}>
            <Icon name="clipboard" size={32} color={colors.mutedGray} />
            <Text style={styles.pickerEmptyTitle}>{t('workouts.empty_title')}</Text>
            <Text style={styles.pickerEmptyDesc}>
              {t('schedule.picker_no_workouts_desc', 'Bạn chưa có giáo án nào. Hãy tạo giáo án trước rồi lên lịch sau.')}
            </Text>
            <TouchableOpacity
              style={[styles.pickerEmptyBtn, { backgroundColor: colors.electric }]}
              onPress={() => {
                setPickerOpen(false);
                (navigation as any).navigate('Workouts');
              }}
            >
              <Text style={[styles.pickerEmptyBtnText, { color: colors.background }]}>
                {t('workouts.empty_action')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          workouts.map((w) => (
            <TouchableOpacity
              key={w.id}
              style={styles.pickRow}
              onPress={() => {
                setPickerOpen(false);
                setFormWorkoutId(w.id);
              }}
            >
              <View style={styles.pickText}>
                <Text style={styles.pickName}>{w.name}</Text>
                <Text style={styles.pickMeta}>
                  {t('workouts.exercise_count', {
                    count: summaries.get(w.id)?.exerciseCount ?? 0,
                  })}
                </Text>
              </View>
              <Icon name="chevron-right" size={18} color={colors.mutedGray} />
            </TouchableOpacity>
          ))
        )}
      </Modal>


      {/* Step 2 — date, time, repeat, reminder (design 06b). */}
      <ScheduleFormModal
        isOpen={!!formWorkoutId}
        onClose={() => setFormWorkoutId(null)}
        onSubmit={handleSubmit}
        workoutName={selectedWorkout?.name}
        workoutMeta={
          selectedWorkout
            ? t('workouts.exercise_count', {
                count: summaries.get(selectedWorkout.id)?.exerciseCount ?? 0,
              })
            : undefined
        }
        initialDate={selectedDate?.toISOString()}
        isSaving={isScheduling}
      />

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title={t('schedule.delete_title')}
        message={t('schedule.delete_message')}
        confirmText={t('common.delete')}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (pendingDelete) await deleteSchedule(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 18,
    },
    headerText: { flex: 1 },
    title: { fontSize: 26, fontWeight: '900', color: colors.onSurface },
    subtitle: { fontSize: 12, color: colors.mutedGray, marginTop: 4 },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.electric,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modeSwitch: { marginBottom: 20 },
    pickRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    pickText: { flex: 1 },
    pickName: { fontSize: 14, fontWeight: '800', color: colors.onSurface },
    pickMeta: { fontSize: 11, color: colors.mutedGray, marginTop: 3 },
    pickerEmpty: {
      alignItems: 'center',
      paddingVertical: 28,
      gap: 10,
    },
    pickerEmptyTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.onSurface,
      textAlign: 'center',
    },
    pickerEmptyDesc: {
      fontSize: 12,
      color: colors.mutedGray,
      textAlign: 'center',
      lineHeight: 18,
      paddingHorizontal: 8,
    },
    pickerEmptyBtn: {
      marginTop: 6,
      borderRadius: 10,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    pickerEmptyBtnText: {
      fontSize: 13,
      fontWeight: '800',
    },
    rangeNote: {
      fontSize: 11,
      color: colors.mutedGray,
      textAlign: 'center',
      marginTop: 14,
    },
  });
