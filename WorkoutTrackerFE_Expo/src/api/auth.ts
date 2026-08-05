import * as SecureStore from 'expo-secure-store';
import { apiClient, isMockMode } from './client';
import { AuthResponse, User } from '../types';

function decodeToken(token: string): any {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (!email.includes('@') && email.length < 3) {
        throw new Error('Invalid email or password (min 4 characters)');
      }
      const mockUser: User = {
        id: 'usr1',
        name: email.split('@')[0].toUpperCase(),
        email: email.includes('@') ? email : `${email}@pulse.com`,
        username: email.split('@')[0],
      };
      const response: AuthResponse = { token: 'pulse_jwt_mock_token_12345', user: mockUser };
      await SecureStore.setItemAsync('pulse_auth_token', response.token);
      await SecureStore.setItemAsync('pulse_user', JSON.stringify(response.user));
      return response;
    }

    const res = await apiClient.post<{ token: string; user: any }>('/auth/login', { userName: email, password });
    const token = res.data.token;
    const backendUser = res.data.user;
    const decoded = decodeToken(token);
    const username = backendUser?.userName || decoded?.unique_name || decoded?.sub || email.split('@')[0];
    const userEmail = backendUser?.email || decoded?.email || email;
    const name = backendUser?.fullName || backendUser?.name || decoded?.name || username.toUpperCase();
    const user: User = { id: backendUser?.id || decoded?.sub || 'usr1', name, email: userEmail, username };
    await SecureStore.setItemAsync('pulse_auth_token', token);
    await SecureStore.setItemAsync('pulse_user', JSON.stringify(user));
    return { token, user };
  },

  register: async (name: string, email: string, username: string, password: string): Promise<AuthResponse> => {
    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (password.length < 6) throw new Error('Password must be at least 6 characters long');
      const mockUser: User = { id: 'usr_' + Math.random().toString(36).substr(2, 9), name, email, username };
      const response: AuthResponse = { token: 'pulse_jwt_mock_token_12345', user: mockUser };
      await SecureStore.setItemAsync('pulse_auth_token', response.token);
      await SecureStore.setItemAsync('pulse_user', JSON.stringify(response.user));
      return response;
    }
    const res = await apiClient.post<{ token: string; user: any }>('/auth/register', { userName: username, email, fullName: name, password });
    const token = res.data.token;
    const backendUser = res.data.user;
    const user: User = {
      id: backendUser?.id || '',
      name: backendUser?.fullName || name,
      email: backendUser?.email || email,
      username: backendUser?.userName || username,
    };
    await SecureStore.setItemAsync('pulse_auth_token', token);
    await SecureStore.setItemAsync('pulse_user', JSON.stringify(user));
    return { token, user };
  },

  logout: async (): Promise<void> => {
    await SecureStore.deleteItemAsync('pulse_auth_token');
    await SecureStore.deleteItemAsync('pulse_user');
  },

  getCurrentUser: async (): Promise<User | null> => {
    const userJson = await SecureStore.getItemAsync('pulse_user');
    if (!userJson) return null;
    try { return JSON.parse(userJson); } catch { return null; }
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await SecureStore.getItemAsync('pulse_auth_token');
    return !!token;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (oldPassword === newPassword) throw new Error('New password must be different from the old password');
      return;
    }
    await apiClient.put('/auth/change-password', { oldPassword, newPassword });
  },

  updateProfile: async (fullName: string, email: string): Promise<AuthResponse> => {
    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const currentUser = await authApi.getCurrentUser();
      if (!currentUser) throw new Error('Not logged in');
      const updatedUser: User = { ...currentUser, name: fullName, email };
      await SecureStore.setItemAsync('pulse_user', JSON.stringify(updatedUser));
      return { token: 'pulse_jwt_mock_token_12345', user: updatedUser };
    }
    const res = await apiClient.put<{ token: string; user: any }>('/auth/profile', { fullName, email });
    const token = res.data.token;
    const backendUser = res.data.user;
    const resolvedUser: User = {
      id: backendUser?.id || 'usr1',
      name: backendUser?.fullName || backendUser?.name || fullName,
      email: backendUser?.email || email,
      username: backendUser?.userName || backendUser?.username || '',
    };
    await SecureStore.setItemAsync('pulse_auth_token', token);
    await SecureStore.setItemAsync('pulse_user', JSON.stringify(resolvedUser));
    return { token, user: resolvedUser };
  },
};
