import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { schedulesApi } from '../api/schedules';
import { useToast } from '../../components/Toast';
import { WorkoutSchedule } from '../types';
import { startOfDay } from '../utils/date';
import { queryKeys } from './queryKeys';

/**
 * Shared mutation wiring for both the global schedule list and the per-workout
 * list, so the two never drift in which caches they invalidate.
 */
const useScheduleMutations = (workoutId?: string) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.schedules });
    queryClient.invalidateQueries({ queryKey: queryKeys.reports });
    // Ticking a schedule off counts as training the plan, and both
    // `scheduledDate` and `lastPerformedAt` on the plan list move with it.
    queryClient.invalidateQueries({ queryKey: queryKeys.workouts });
    if (workoutId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutSchedules(workoutId) });
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: Omit<WorkoutSchedule, 'id'>) => schedulesApi.create(data),
    onSuccess: () => {
      invalidate();
      success(t('toast.schedule_created'));
    },
    onError: () => error(t('error.generic')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, date, workoutId: wid }: { id: string; date: string; workoutId?: string }) =>
      schedulesApi.update(id, date, wid ?? workoutId),
    onSuccess: () => {
      invalidate();
      success(t('toast.schedule_updated'));
    },
    onError: () => error(t('error.generic')),
  });

  const deleteMutation = useMutation({
    mutationFn: schedulesApi.delete,
    onSuccess: () => {
      invalidate();
      success(t('toast.schedule_deleted'));
    },
    onError: () => error(t('error.generic')),
  });

  const completeMutation = useMutation({
    mutationFn: schedulesApi.markCompleted,
    onSuccess: () => {
      invalidate();
      success(t('toast.workout_completed'));
    },
    onError: () => error(t('error.generic')),
  });

  return { createMutation, updateMutation, deleteMutation, completeMutation };
};

/**
 * @param range optional server-side date filter; omitted means "everything".
 * The range is part of the cache key, and because it is appended after
 * `queryKeys.schedules` a plain `['schedules']` invalidation still refreshes
 * every ranged query.
 */
export const useSchedules = (range?: { from?: string; to?: string }) => {
  const query = useQuery({
    queryKey: [...queryKeys.schedules, range?.from ?? null, range?.to ?? null],
    queryFn: () => schedulesApi.getAll(range),
    // Stepping through months changes the key. Without this the calendar would
    // blank out to a skeleton on every arrow tap while the next window loads.
    placeholderData: keepPreviousData,
  });
  const { createMutation, updateMutation, deleteMutation, completeMutation } =
    useScheduleMutations();

  return {
    schedules: (query.data || []) as WorkoutSchedule[],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    scheduleWorkout: createMutation.mutateAsync,
    isScheduling: createMutation.isPending,
    updateSchedule: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteSchedule: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    completeSchedule: completeMutation.mutateAsync,
    isCompleting: completeMutation.isPending,
  };
};

/**
 * Today onwards, with no upper bound — what the dashboard and the routine list
 * need ("hôm nay" and "sắp tới"). Both go through this helper rather than
 * building a range each, so they land on the same cache entry instead of
 * issuing two near-identical requests.
 */
export const useUpcomingSchedules = () => {
  const from = useMemo(() => startOfDay(new Date()).toISOString(), []);
  return useSchedules({ from });
};

/** Schedules from `daysBack` days ago onwards. */
export const useRecentSchedules = (daysBack: number) => {
  const from = useMemo(
    () => startOfDay(new Date(Date.now() - daysBack * 86400_000)).toISOString(),
    [daysBack]
  );
  return useSchedules({ from });
};

export const useWorkoutSchedules = (workoutId: string) => {
  const query = useQuery({
    queryKey: queryKeys.workoutSchedules(workoutId),
    queryFn: () => schedulesApi.getByWorkoutId(workoutId),
    enabled: !!workoutId,
  });
  const { createMutation, updateMutation, deleteMutation, completeMutation } =
    useScheduleMutations(workoutId);

  return {
    schedules: (query.data || []) as WorkoutSchedule[],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    scheduleWorkout: (date: string, remindEnabled?: boolean) =>
      createMutation.mutateAsync({
        scheduledDate: date,
        workoutId,
        isCompleted: false,
        remindEnabled,
      }),
    isScheduling: createMutation.isPending,
    updateSchedule: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteSchedule: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    completeSchedule: completeMutation.mutateAsync,
    isCompleting: completeMutation.isPending,
  };
};
