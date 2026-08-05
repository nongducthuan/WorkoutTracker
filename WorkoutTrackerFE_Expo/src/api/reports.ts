import { apiClient, isMockMode } from './client';
import { mockDb } from './mockDb';
import { ReportStats } from '../types';

export const reportsApi = {
  getStats: async (): Promise<ReportStats> => {
    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 600));
      return mockDb.getReports();
    }
    const res = await apiClient.get<ReportStats>('/reports');
    return res.data;
  }
};
