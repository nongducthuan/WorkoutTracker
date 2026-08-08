import { apiClient, isMockMode } from './client';
import { mockDb } from './mockDb';
import { Exercise } from '../types';
import { delay } from './utils';

export const exercisesApi = {
  getAll: async (): Promise<Exercise[]> => {
    if (isMockMode) {
      await delay(300);
      return [];
    }
    const res = await apiClient.get<Exercise[]>('/exercises');
    return res.data;
  }
};
