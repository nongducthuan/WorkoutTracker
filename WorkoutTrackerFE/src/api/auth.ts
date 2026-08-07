import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'workout_tracker_auth_token';

export const authApi = {
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      // For now, let's return true by default for testing, 
      // or check if token exists if you have a login flow.
      // return !!token;
      return true; // Bypass login for development
    } catch (e) {
      return false;
    }
  },
  login: async (token: string) => {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  },
  logout: async () => {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  }
};
