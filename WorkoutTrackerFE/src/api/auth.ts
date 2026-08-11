import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './client';

const AUTH_TOKEN_KEY = 'workout_tracker_auth_token';
const AUTH_USER_KEY = 'pulse_user';

export const authApi = {
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return !!token;
    } catch (e) {
      return false;
    }
  },

  login: async (identifier?: string, password?: string) => {
    const res = await apiClient.post('/auth/login', { userName: identifier, password });
    if (res.data.token) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, res.data.token);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data.user));
    }
    return res.data;
  },

  register: async (fullName?: string, userName?: string, email?: string, password?: string) => {
    const res = await apiClient.post('/auth/register', { fullName, userName, email, password });
    if (res.data.token) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, res.data.token);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data.user));
    }
    return res.data;
  },

  getCurrentUser: async () => {
    try {
      const userStr = await AsyncStorage.getItem(AUTH_USER_KEY);
      if (userStr) return JSON.parse(userStr);
      return null;
    } catch {
      return null;
    }
  },

  updateProfile: async (fullName: string, email: string) => {
    const res = await apiClient.put('/auth/profile', { fullName, email });
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data.user));
    return res.data;
  },

  changePassword: async (oldPw: string, newPw: string) => {
    const res = await apiClient.put('/auth/change-password', { oldPassword: oldPw, newPassword: newPw });
    return res.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(AUTH_USER_KEY);
  },

  forgotPassword: async (email: string) => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data; 
  },

  verifyOtp: async (email: string, otpCode: string) => {
    const res = await apiClient.post('/auth/verify-otp', { email, otpCode });
    return res.data; 
  },

  resetPassword: async (resetToken: string, newPassword: string) => {
    const res = await apiClient.put('/auth/reset-password', { resetToken, newPassword });
    return res.data; 
  },
};