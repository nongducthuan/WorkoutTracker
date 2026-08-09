import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:8080';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const isMockMode = true;

let navigateToLogin: () => void = () => {};

export const setNavigateToLogin = (navigateFn: () => void) => {
  navigateToLogin = navigateFn;
};

// Add a request interceptor to attach the token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('workout_tracker_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      await AsyncStorage.removeItem('workout_tracker_auth_token');
      navigateToLogin();
    }
    return Promise.reject(error);
  }
);
