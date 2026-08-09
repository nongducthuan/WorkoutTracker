import { apiClient, isMockMode } from './client';
import { mockDb } from './mockDb';
import { Exercise } from '../types';
import { delay } from './utils';

interface PaginatedExercisesResponse {
  data: Exercise[];
  total: number;
  page: number;
  pageSize: number;
}

export const exercisesApi = {
  getAll: async (): Promise<Exercise[]> => {
    if (isMockMode) {
      await delay(300);
      return mockDb.getExercises();
    }
    const res = await apiClient.get<PaginatedExercisesResponse>('/exercises', {
      params: { pageSize: 100 },
    });
    return res.data.data;
  }
};