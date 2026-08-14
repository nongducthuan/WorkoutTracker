import { apiClient, isMockMode } from './client';
import { mockDb } from './mockDb';
import { WorkoutSchedule } from '../types';
import { delay } from './utils';

export const schedulesApi = {
  /** `range` narrows the query server-side instead of downloading every schedule. */
  getAll: async (range?: { from?: string; to?: string }): Promise<WorkoutSchedule[]> => {
    if (isMockMode) {
      await delay(400);
      return mockDb.getWorkoutSchedules();
    }
    const res = await apiClient.get<WorkoutSchedule[]>('/workout-schedules', {
      params: { from: range?.from, to: range?.to },
    });
    return res.data;
  },

  getByWorkoutId: async (workoutId: string): Promise<WorkoutSchedule[]> => {
    if (isMockMode) {
      await delay(300);
      return mockDb.getWorkoutSchedulesForWorkout(workoutId);
    }
    const res = await apiClient.get<WorkoutSchedule[]>(`/workout-schedules/workout/${workoutId}`);
    return res.data;
  },

  create: async (data: Omit<WorkoutSchedule, 'id'>): Promise<WorkoutSchedule> => {
    if (isMockMode) {
      await delay(300);
      return mockDb.addWorkoutSchedule(data);
    }
    const res = await apiClient.post<WorkoutSchedule>('/workout-schedules', {
      scheduledDate: data.scheduledDate,
      workoutId: data.workoutId,
      remindEnabled: data.remindEnabled,
    });
    return res.data;
  },

  update: async (id: string, date: string, workoutId?: string): Promise<WorkoutSchedule> => {
    if (isMockMode) {
      await delay(300);
      return mockDb.updateWorkoutSchedule(id, date);
    }
    const payload: any = { scheduledDate: date };
    if (workoutId) payload.workoutId = workoutId;
    const res = await apiClient.put<WorkoutSchedule>(`/workout-schedules/${id}`, payload);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    if (isMockMode) {
      await delay(300);
      return mockDb.deleteWorkoutSchedule(id);
    }
    await apiClient.delete(`/workout-schedules/${id}`);
  },

  getById: async (id: string): Promise<WorkoutSchedule> => {
    if (isMockMode) {
      await delay(200);
      const found = mockDb.getWorkoutSchedules().find(s => s.id === id);
      if (!found) throw new Error('Schedule not found');
      return found;
    }
    const res = await apiClient.get<WorkoutSchedule>(`/workout-schedules/${id}`);
    return res.data;
  },

  markCompleted: async (id: string): Promise<void> => {
    if (isMockMode) {
      await delay(300);
      const schedules = mockDb.getWorkoutSchedules();
      const s = schedules.find(item => item.id === id);
      if (s) s.isCompleted = true;
      return;
    }
    await apiClient.put(`/workout-schedules/${id}/complete`);
  },
};
