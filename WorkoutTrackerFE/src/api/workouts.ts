import { apiClient, isMockMode } from './client';
import { mockDb } from './mockDb';
import { Workout, WorkoutExercise } from '../types';
import { delay } from './utils';

export const workoutsApi = {
  getAll: async (): Promise<Workout[]> => {
    if (isMockMode) {
      await delay(500);
      return mockDb.getWorkouts();
    }
    const res = await apiClient.get<Workout[]>('/workouts');
    return res.data;
  },

  getById: async (id: string): Promise<Workout> => {
    if (isMockMode) {
      await delay(300);
      const workout = mockDb.getWorkouts().find(w => w.id === id);
      if (!workout) throw new Error('Workout not found');
      return workout;
    }
    const res = await apiClient.get<Workout>(`/workouts/${id}`);
    return res.data;
  },

  create: async (workout: Omit<Workout, 'id'>): Promise<Workout> => {
    if (isMockMode) {
      await delay(400);
      return mockDb.saveWorkout(workout);
    }
    const res = await apiClient.post<Workout>('/workouts', { name: workout.name, description: workout.description });
    return res.data;
  },

  update: async (id: string, data: Partial<Workout>): Promise<Workout> => {
    if (isMockMode) {
      await delay(300);
      return mockDb.updateWorkout(id, data);
    }
    await apiClient.put<string>(`/workouts/${id}`, { name: data.name, description: data.description });
    return { id, name: data.name ?? '', description: data.description ?? '' };
  },

  delete: async (id: string): Promise<void> => {
    if (isMockMode) {
      await delay(400);
      return mockDb.deleteWorkout(id);
    }
    await apiClient.delete<string>(`/workouts/${id}`);
  },

  getExercises: async (workoutId: string): Promise<WorkoutExercise[]> => {
    if (isMockMode) {
      await delay(400);
      return mockDb.getWorkoutExercises(workoutId);
    }
    const res = await apiClient.get<WorkoutExercise[]>(`/workout-exercises/${workoutId}`);
    return res.data;
  },

  addExercise: async (data: Omit<WorkoutExercise, 'id'>): Promise<WorkoutExercise> => {
    if (isMockMode) {
      await delay(300);
      return mockDb.addWorkoutExercise(data);
    }
    await apiClient.post<string>('/workout-exercises', data);
    return { id: Math.random().toString(36).substr(2, 9), ...data };
  },

  updateExercise: async (id: string, data: Partial<WorkoutExercise>): Promise<WorkoutExercise> => {
    if (isMockMode) {
      await delay(300);
      return mockDb.updateWorkoutExercise(id, data);
    }
    await apiClient.put<string>(`/workout-exercises/${id}`, data);
    return { id, sets: data.sets ?? 0, repetitions: data.repetitions ?? 0, weight: data.weight ?? 0, exerciseId: data.exerciseId ?? 0 };
  },

  deleteExercise: async (id: string): Promise<void> => {
    if (isMockMode) {
      await delay(300);
      return mockDb.deleteWorkoutExercise(id);
    }
    await apiClient.delete(`/workout-exercises/${id}`);
  },
};
