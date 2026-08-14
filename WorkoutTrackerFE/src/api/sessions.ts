import { apiClient } from './client';

export interface SessionSetInput {
  exerciseId: number;
  /** 1-based position of the set within its exercise. */
  setIndex: number;
  reps: number;
  weight: number;
  completedAt?: string;
}

export interface SessionSet extends SessionSetInput {
  id: string;
  exerciseName: string;
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  workoutName: string;
  scheduleId: string | null;
  startedAt: string;
  finishedAt: string | null;
  durationSec: number;
  totalVolume: number;
  note: string | null;
  totalSets: number;
  exercisesCount: number;
  sets: SessionSet[];
}

export interface PaginatedSessions {
  data: WorkoutSession[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * What was actually lifted, as opposed to what the routine planned. Everything
 * on the summary (04c) and history (04g) screens comes from here rather than
 * from the routine configuration.
 */
export const sessionsApi = {
  getAll: async (params?: {
    from?: string;
    to?: string;
    workoutId?: string;
    finishedOnly?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedSessions> => {
    const res = await apiClient.get<PaginatedSessions>('/workout-sessions', {
      params: {
        ...params,
        finishedOnly: params?.finishedOnly ? 'true' : undefined,
      },
    });
    return res.data;
  },

  getById: async (id: string): Promise<WorkoutSession> => {
    const res = await apiClient.get<WorkoutSession>(`/workout-sessions/${id}`);
    return res.data;
  },

  /** Opens a session; call `finish` when the user is done. */
  start: async (params: {
    workoutId: string;
    scheduleId?: string;
    startedAt?: string;
  }): Promise<WorkoutSession> => {
    const res = await apiClient.post<WorkoutSession>('/workout-sessions', params);
    return res.data;
  },

  /** Records a finished workout in one request, for syncing an offline session. */
  log: async (params: {
    workoutId: string;
    scheduleId?: string;
    startedAt?: string;
    finishedAt?: string;
    durationSec?: number;
    note?: string;
    sets: SessionSetInput[];
  }): Promise<WorkoutSession> => {
    const res = await apiClient.post<WorkoutSession>('/workout-sessions', params);
    return res.data;
  },

  finish: async (
    id: string,
    params: {
      sets: SessionSetInput[];
      durationSec?: number;
      finishedAt?: string;
      note?: string;
    }
  ): Promise<WorkoutSession> => {
    const res = await apiClient.put<WorkoutSession>(`/workout-sessions/${id}/finish`, params);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/workout-sessions/${id}`);
  },
};
