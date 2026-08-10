import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutsApi } from '../api/workouts';
import { exercisesApi } from '../api/exercises';
import { schedulesApi } from '../api/schedules';
import { commentsApi } from '../api/comments';
import { reportsApi } from '../api/reports';
import { useToast } from '../../components/Toast';
import { Workout, WorkoutExercise } from '../types';

export const useWorkouts = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const query = useQuery({
    queryKey: ['workouts'],
    queryFn: workoutsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: workoutsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      success('Workout created successfully');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to create workout');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Workout> }) => 
      workoutsApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workout', updated.id] });
      success('Workout updated successfully');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to update workout');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: workoutsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      success('Workout deleted successfully');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to delete workout');
    }
  });

  return {
    workouts: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
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

  const query = useQuery({
    queryKey: ['workout', id],
    queryFn: () => workoutsApi.getById(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Workout>) => workoutsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout', id] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      success('Workout overview updated');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to update workout');
    }
  });

  return {
    workout: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    updateWorkout: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};

export const useWorkoutExercises = (workoutId: string) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const query = useQuery({
    queryKey: ['workout-exercises', workoutId],
    queryFn: () => workoutsApi.getExercises(workoutId),
    enabled: !!workoutId,
  });

  const addMutation = useMutation({
    mutationFn: workoutsApi.addExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-exercises', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      success('Exercise added to workout');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to add exercise');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkoutExercise> }) => 
      workoutsApi.updateExercise(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-exercises', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      success('Exercise details updated');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to update exercise');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: workoutsApi.deleteExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-exercises', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      success('Exercise removed from workout');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to remove exercise');
    }
  });

  return {
    workoutExercises: query.data || [],
    isLoading: query.isLoading,
    addExercise: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    updateExercise: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteExercise: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};





export const useExercises = () => {
  const query = useQuery({
    queryKey: ['exercises-library'],
    queryFn: exercisesApi.getAll,
  });

  return {
    exercises: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};





export const useSchedules = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const query = useQuery({
    queryKey: ['schedules'],
    queryFn: schedulesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: schedulesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      success('Workout scheduled successfully');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to schedule workout');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, date, workoutId }: { id: string; date: string; workoutId?: string }) => 
      schedulesApi.update(id, date, workoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      success('Schedule updated successfully');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to update schedule');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: schedulesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      success('Schedule deleted successfully');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to delete schedule');
    }
  });

  const completeMutation = useMutation({
    mutationFn: schedulesApi.markCompleted,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      success('Congratulations! Workout completed');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to log workout completion');
    }
  });

  return {
    schedules: query.data || [],
    isLoading: query.isLoading,
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





export const useWorkoutSchedules = (workoutId: string) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const query = useQuery({
    queryKey: ['workout-schedules', workoutId],
    queryFn: () => schedulesApi.getByWorkoutId(workoutId),
    enabled: !!workoutId,
  });

  const createMutation = useMutation({
    mutationFn: (date: string) =>
      schedulesApi.create({ scheduledDate: date, workoutId, isCompleted: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-schedules', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      success('Workout scheduled successfully');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to schedule workout');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      schedulesApi.update(id, date, workoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-schedules', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      success('Schedule updated successfully');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to update schedule');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: schedulesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-schedules', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      success('Schedule removed');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to remove schedule');
    }
  });

  const completeMutation = useMutation({
    mutationFn: schedulesApi.markCompleted,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-schedules', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      success('Congratulations! Workout completed');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to mark as complete');
    }
  });

  return {
    schedules: query.data || [],
    isLoading: query.isLoading,
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





export const useComments = (workoutId: string) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const query = useQuery({
    queryKey: ['comments', workoutId],
    queryFn: () => commentsApi.getByWorkoutId(workoutId),
    enabled: !!workoutId,
  });

  const createMutation = useMutation({
    mutationFn: (comment: string) => commentsApi.create(workoutId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', workoutId] });
      success('Comment added');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to add comment');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) => 
      commentsApi.update(id, comment, workoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', workoutId] });
      success('Comment updated');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to update comment');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: commentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', workoutId] });
      success('Comment deleted');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to delete comment');
    }
  });

  return {
    comments: query.data || [],
    isLoading: query.isLoading,
    addComment: createMutation.mutateAsync,
    isAdding: createMutation.isPending,
    updateComment: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteComment: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};





export const useReports = () => {
  const query = useQuery({
    queryKey: ['reports'],
    queryFn: reportsApi.getStats,
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
