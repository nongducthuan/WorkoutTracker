import { apiClient, isMockMode } from './client';
import { mockDb } from './mockDb';
import { ReportStats } from '../types';
import { delay } from './utils';

export interface ServerPersonalRecord {
  exerciseId: number;
  exerciseName: string;
  category: string;
  bestWeight: number;
  bestWeightReps: number;
  bestWeightAt: string;
  estimatedOneRepMax: number;
  estimatedOneRepMaxAt: string;
  bestSetVolume: number;
  totalSets: number;
}

export interface ServerMuscleLoadGroup {
  category: string;
  volume: number;
  sets: number;
  reps: number;
  percentage: number;
}

export interface ServerMuscleLoadExercise {
  exerciseId: number;
  exerciseName: string;
  category: string;
  volume: number;
  sets: number;
  reps: number;
}

export interface ServerMuscleLoad {
  days: number;
  from: string;
  to: string;
  totalVolume: number;
  totalSets: number;
  groups: ServerMuscleLoadGroup[];
  exercises: ServerMuscleLoadExercise[];
}

export interface ServerExerciseHistoryPoint {
  weekStart: string;
  week: string;
  weight: number;
  volume: number;
  sets: number;
}

export interface ServerExerciseHistorySession {
  sessionId: string;
  date: string;
  workoutName: string;
  sets: number;
  reps: number;
  weight: number;
  volume: number;
  isPr: boolean;
}

export interface ServerExerciseHistory {
  exerciseId: number;
  exerciseName: string;
  currentPr: number;
  currentPrAt: string | null;
  estimatedOneRepMax: number;
  gain: number;
  totalSessions: number;
  points: ServerExerciseHistoryPoint[];
  sessions: ServerExerciseHistorySession[];
}

export const reportsApi = {
  getStats: async (): Promise<ReportStats> => {
    if (isMockMode) {
      await delay(300);
      return mockDb.getReports();
    }
    const res = await apiClient.get<ReportStats>('/reports');
    return res.data;
  },

  /**
   * Computed server-side from logged sets. Replaces fetching every routine's
   * exercises one request at a time just to find the heaviest weight.
   */
  getPersonalRecords: async (): Promise<ServerPersonalRecord[]> => {
    if (isMockMode) {
      await delay(300);
      return [];
    }
    const res = await apiClient.get<ServerPersonalRecord[]>('/reports/personal-records');
    return res.data;
  },

  getMuscleLoad: async (days = 7): Promise<ServerMuscleLoad> => {
    if (isMockMode) {
      await delay(300);
      return { days, from: '', to: '', totalVolume: 0, totalSets: 0, groups: [], exercises: [] };
    }
    const res = await apiClient.get<ServerMuscleLoad>('/reports/muscle-load', {
      params: { days },
    });
    return res.data;
  },

  /** Design 04g. Built from logged sets, so the PR badge means a real lift. */
  getExerciseHistory: async (
    exerciseId: number,
    weeks = 8
  ): Promise<ServerExerciseHistory> => {
    const res = await apiClient.get<ServerExerciseHistory>(
      `/reports/exercise-history/${exerciseId}`,
      { params: { weeks } }
    );
    return res.data;
  },
};
