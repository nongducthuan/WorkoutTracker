import { apiClient, isMockMode } from './client';
import { mockDb } from './mockDb';
import { ReportStats } from '../types';
import { delay } from './utils';

export const reportsApi = {
  getStats: async (): Promise<ReportStats> => {
    if (isMockMode) {
      await delay(300);
      return { weeklyWorkouts: [], recentActivity: [] };
    }
    const res = await apiClient.get<ReportStats>('/reports');
    return res.data;
  }
};
