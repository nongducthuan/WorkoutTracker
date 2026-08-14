import { apiClient } from './client';

/** Mirrors the server's UserSettings row. Weekdays follow JS getDay(): 0 = Sunday. */
export interface ServerSettings {
  weeklyGoal: number;
  preferredDays: number[];
  autoSchedule: boolean;
  weightUnit: 'kg' | 'lb';
  restTimerSeconds: number;
  autoStartRestTimer: boolean;
  keepScreenOn: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
  language: 'vi' | 'en';
  theme: 'light' | 'dark' | 'system';
  goal: 'muscle' | 'fat_loss' | 'endurance';
  level: 'beginner' | 'intermediate' | 'advanced';
  onboardingCompleted: boolean;
  updatedAt: string;
}

export const settingsApi = {
  /** The server creates the row with defaults on the first read. */
  get: async (): Promise<ServerSettings> => {
    const res = await apiClient.get<ServerSettings>('/me/settings');
    return res.data;
  },

  update: async (patch: Partial<ServerSettings>): Promise<ServerSettings> => {
    const res = await apiClient.put<ServerSettings>('/me/settings', patch);
    return res.data;
  },
};
