import { apiClient, isMockMode } from './client';
import { mockDb } from './mockDb';
import { Exercise } from '../types';

export const exercisesApi = {
  getAll: async (): Promise<Exercise[]> => {
    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockDb.getExercises();
    }
    const res = await apiClient.get<{ data: Exercise[]; total: number; page: number; pageSize: number }>('/exercises');
    return res.data.data;
  }
};
