import { apiClient, isMockMode } from './client';
import { mockDb } from './mockDb';
import { WorkoutSchedule } from '../types';

export const schedulesApi = {
  getAll: async (): Promise<WorkoutSchedule[]> => {
    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockDb.getWorkoutSchedules();
    }
    const res = await apiClient.get<WorkoutSchedule[]>('/workout-schedules');
    return res.data;
  },

  getByWorkoutId: async (workoutId: string): Promise<WorkoutSchedule[]> => {
    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockDb.getWorkoutSchedulesForWorkout(workoutId);
    }
    const res = await apiClient.get<WorkoutSchedule[]>(`/workout-schedules/workout/${workoutId}`);
    return res.data;
  },

  create: async (data: Omit<WorkoutSchedule, 'id'>): Promise<WorkoutSchedule> => {
    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockDb.addWorkoutSchedule(data);
    }
    await apiClient.post<string>('/workout-schedules', { scheduledDate: data.scheduledDate, workoutId: data.workoutId });
    return { id: Math.random().toString(36).substr(2, 9), ...data };
  },

  update: async (id: string, date: string, workoutId?: string): Promise<WorkoutSchedule> => {
    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockDb.updateWorkoutSchedule(id, date);
    }
    const payload: any = { scheduledDate: date };
    if (workoutId) payload.workoutId = workoutId;
    await apiClient.put<string>(`/workout-schedules/${id}`, payload);
    return { id, scheduledDate: date, workoutId: workoutId ?? '', isCompleted: false };
  },

  delete: async (id: string): Promise<void> => {
    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockDb.deleteWorkoutSchedule(id);
    }
    await apiClient.delete(`/workout-schedules/${id}`);
  },

  complete: async (id: string): Promise<void> => {
    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const schedules = mockDb.getWorkoutSchedules();
      const s = schedules.find(item => item.id === id);
      if (s) s.isCompleted = true;
      return;
    }
    await apiClient.put(`/workout-schedules/${id}/complete`);
  },
};
