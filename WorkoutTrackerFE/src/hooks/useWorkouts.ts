import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { workoutsApi } from '../api/workouts';
import { useToast } from '../../components/Toast';
import { Workout } from '../types';
import { queryKeys } from './queryKeys';

export const useWorkouts = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  const query = useQuery({
    queryKey: queryKeys.workouts,
    queryFn: workoutsApi.getAll,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.workouts });
    queryClient.invalidateQueries({ queryKey: queryKeys.schedules });
    queryClient.invalidateQueries({ queryKey: queryKeys.reports });
  };

  const createMutation = useMutation({
    mutationFn: workoutsApi.create,
    onSuccess: () => {
      invalidateAll();
      success(t('toast.workout_created'));
    },
    onError: () => error(t('error.generic')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Workout> }) =>
      workoutsApi.update(id, data),
    onSuccess: (updated) => {
      invalidateAll();
      queryClient.invalidateQueries({ queryKey: queryKeys.workout(updated.id) });
      success(t('toast.workout_updated'));
    },
    onError: () => error(t('error.generic')),
  });

  const deleteMutation = useMutation({
    mutationFn: workoutsApi.delete,
    onSuccess: () => {
      invalidateAll();
      success(t('toast.workout_deleted'));
    },
    onError: () => error(t('error.generic')),
  });

  return {
    workouts: (query.data || []) as Workout[],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createWorkout: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateWorkout: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteWorkout: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export const useWorkout = (id: string) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  const query = useQuery({
    queryKey: queryKeys.workout(id),
    queryFn: () => workoutsApi.getById(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Workout>) => workoutsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workout(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workouts });
      success(t('toast.workout_updated'));
    },
    onError: () => error(t('error.generic')),
  });

  return {
    workout: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    updateWorkout: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};
