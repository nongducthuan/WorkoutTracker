import { apiClient, isMockMode } from './client';
import { mockDb } from './mockDb';
import { WorkoutComment } from '../types';
import * as SecureStore from 'expo-secure-store';

export const commentsApi = {
  getByWorkoutId: async (workoutId: string): Promise<WorkoutComment[]> => {
    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockDb.getWorkoutComments(workoutId);
    }
    const res = await apiClient.get<WorkoutComment[]>(`/workout-comments/${workoutId}`);
    return res.data;
  },

  create: async (workoutId: string, comment: string): Promise<WorkoutComment> => {
    // Fetch user from SecureStore instead of localStorage
    const userJson = await SecureStore.getItemAsync('pulse_user');
    const user = userJson ? JSON.parse(userJson) : { name: 'Current User', id: 'usr1' };

    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockDb.addWorkoutComment({ workoutId, comment, userName: user.name, userId: user.id });
    }
    await apiClient.post<string>('/workout-comments', { workoutId, comment });
    return {
      id: Math.random().toString(36).substr(2, 9),
      workoutId,
      comment,
      userName: user.name,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
  },

  update: async (id: string, comment: string, workoutId: string): Promise<WorkoutComment> => {
    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const comments = mockDb.getWorkoutComments(workoutId);
      const found = comments.find(c => c.id === id);
      if (found) { found.comment = comment; return found; }
      throw new Error('Comment not found');
    }
    await apiClient.put<string>(`/workout-comments/${id}`, { comment });
    return { id, workoutId, comment, createdAt: new Date().toISOString() };
  },

  delete: async (id: string): Promise<void> => {
    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockDb.deleteWorkoutComment(id);
    }
    await apiClient.delete(`/workout-comments/${id}`);
  },
};
