import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || '';

export const isMockMode = !API_BASE_URL || API_BASE_URL === 'mock';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('pulse_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — unwrap ApiResponse<T> envelope + handle 401
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
      response.data = body.data;
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('pulse_auth_token');
      await SecureStore.deleteItemAsync('pulse_user');
      router.replace('/(auth)/login');
    }

    const serverError = error.response?.data;
    if (serverError && typeof serverError === 'object') {
      const message =
        serverError.Message ||
        serverError.message ||
        serverError.description ||
        serverError.error;
      if (message) return Promise.reject(new Error(message));
    }
    return Promise.reject(error);
  }
);
