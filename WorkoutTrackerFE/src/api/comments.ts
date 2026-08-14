import { apiClient, isMockMode } from './client';
import { mockDb } from './mockDb';
import { WorkoutComment } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { delay } from './utils';

export const commentsApi = {
  getByWorkoutId: async (workoutId: string): Promise<WorkoutComment[]> => {
    if (isMockMode) {
      await delay(300);
      return mockDb.getWorkoutComments(workoutId);
    }
    const res = await apiClient.get<WorkoutComment[]>(`/workout-comments/${workoutId}`);
    return res.data;
  },

  create: async (workoutId: string, comment: string): Promise<WorkoutComment> => {
    const userJson = await AsyncStorage.getItem('pulse_user');
    const user = userJson ? JSON.parse(userJson) : { name: 'Current User', id: 'usr1' };

    if (isMockMode) {
      await delay(300);
      return mockDb.addWorkoutComment({ workoutId, comment, userName: user.name, userId: user.id, createdAt: new Date().toISOString() });
    }
    const res = await apiClient.post<WorkoutComment>('/workout-comments', { workoutId, comment });
    return res.data;
  },

  update: async (id: string, comment: string, workoutId: string): Promise<WorkoutComment> => {
    if (isMockMode) {
      await delay(300);
      const comments = mockDb.getWorkoutComments(workoutId);
      const found = comments.find(c => c.id === id);
      if (found) { found.comment = comment; return found; }
      throw new Error('Comment not found');
    }
    const res = await apiClient.put<WorkoutComment>(`/workout-comments/${id}`, { comment });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    if (isMockMode) {
      await delay(300);
      return mockDb.deleteWorkoutComment(id);
    }
    await apiClient.delete(`/workout-comments/${id}`);
  },
};
