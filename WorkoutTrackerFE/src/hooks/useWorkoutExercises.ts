import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { workoutsApi } from '../api/workouts';
import { exercisesApi } from '../api/exercises';
import { useToast } from '../../components/Toast';
import { Exercise, WorkoutExercise } from '../types';
import { queryKeys } from './queryKeys';

export const useWorkoutExercises = (workoutId: string) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  const query = useQuery({
    queryKey: queryKeys.workoutExercises(workoutId),
    queryFn: () => workoutsApi.getExercises(workoutId),
    enabled: !!workoutId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.workoutExercises(workoutId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.reports });
  };

  const addMutation = useMutation({
    mutationFn: workoutsApi.addExercise,
    onSuccess: () => {
      invalidate();
      success(t('toast.exercise_added'));
    },
    onError: () => error(t('error.generic')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkoutExercise> }) =>
      workoutsApi.updateExercise(id, data),
    onSuccess: () => {
      invalidate();
      success(t('toast.exercise_updated'));
    },
    onError: () => error(t('error.generic')),
  });

  const deleteMutation = useMutation({
    mutationFn: workoutsApi.deleteExercise,
    onSuccess: () => {
      invalidate();
      success(t('toast.exercise_removed'));
    },
    onError: () => error(t('error.generic')),
  });

  return {
    workoutExercises: (query.data || []) as WorkoutExercise[],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    addExercise: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    updateExercise: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteExercise: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

/** The global exercise catalogue (design 05). */
export const useExercises = () => {
  const query = useQuery({
    queryKey: queryKeys.exercisesLibrary,
    queryFn: exercisesApi.getAll,
  });

  return {
    exercises: (query.data || []) as Exercise[],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useExercise = (exerciseId?: number) => {
  const query = useQuery({
    queryKey: queryKeys.exerciseDetail(exerciseId!),
    queryFn: () => exercisesApi.getById(exerciseId!),
    enabled: !!exerciseId,
    // Exercise catalogue data is stable — no need to re-fetch on every visit.
    staleTime: 30 * 60_000,
  });

  return {
    exercise: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
