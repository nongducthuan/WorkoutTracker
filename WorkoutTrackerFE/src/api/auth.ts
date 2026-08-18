import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  apiClient,
  AUTH_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  AUTH_USER_KEY,
  clearSession,
  emitSessionChange,
} from './client';

export interface ApiUser {
  id: string;
  fullName: string;
  email: string;
  userName: string;
  avatarUrl: string | null;
  weightKg: number | null;
  heightCm: number | null;
  /** `YYYY-MM-DD` */
  birthday: string | null;
}

export interface AuthResult {
  token: string;
  refreshToken: string;
  expiresIn: string;
  user: ApiUser;
}

export interface ProfilePatch {
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  weightKg?: number | null;
  heightCm?: number | null;
  birthday?: string | null;
}

/**
 * `isNewSession` separates signing in from `updateProfile`, which also returns a
 * fresh token pair. Only the former should tell the app to rebuild per-account
 * state — a profile edit must not wipe the caches the user is looking at.
 */
const persistSession = async (data: AuthResult, isNewSession = false) => {
  if (!data?.token) return data;
  await AsyncStorage.multiSet([
    [AUTH_TOKEN_KEY, data.token],
    [REFRESH_TOKEN_KEY, data.refreshToken],
    [AUTH_USER_KEY, JSON.stringify(data.user)],
  ]);
  if (isNewSession) await emitSessionChange('signed-in');
  return data;
};

export const authApi = {
  isAuthenticated: async (): Promise<boolean> => {
    try {
      return !!(await AsyncStorage.getItem(AUTH_TOKEN_KEY));
    } catch {
      return false;
    }
  },

  login: async (identifier?: string, password?: string): Promise<AuthResult> => {
    const res = await apiClient.post<AuthResult>('/auth/login', {
      userName: identifier,
      password,
    });
    return persistSession(res.data, true);
  },

  register: async (
    fullName?: string,
    userName?: string,
    email?: string,
    password?: string
  ): Promise<AuthResult> => {
    const res = await apiClient.post<AuthResult>('/auth/register', {
      fullName,
      userName,
      email,
      password,
    });
    return persistSession(res.data, true);
  },

  /** The locally cached profile — no network call. */
  getCurrentUser: async (): Promise<ApiUser | null> => {
    try {
      const userStr = await AsyncStorage.getItem(AUTH_USER_KEY);
      return userStr ? (JSON.parse(userStr) as ApiUser) : null;
    } catch {
      return null;
    }
  },

  /** The authoritative profile from the server; refreshes the cache. */
  fetchCurrentUser: async (): Promise<ApiUser> => {
    const res = await apiClient.get<ApiUser>('/auth/me');
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data));
    return res.data;
  },

  updateProfile: async (patch: ProfilePatch): Promise<AuthResult> => {
    const res = await apiClient.put<AuthResult>('/auth/profile', patch);
    return persistSession(res.data);
  },

  changePassword: async (oldPw: string, newPw: string) => {
    const res = await apiClient.put('/auth/change-password', {
      oldPassword: oldPw,
      newPassword: newPw,
    });
    // The server revokes all refresh tokens on a password change, but the
    // current access token stays valid until it expires — no need to sign
    // the user out. Just drop the stale refresh token so the next silent
    // refresh attempt will prompt a login instead of silently failing.
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    return res.data;
  },

  logout: async () => {
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    try {
      // Best effort: the local session is cleared either way, but telling the
      // server lets it revoke the refresh token instead of leaving it live.
      await apiClient.post('/auth/logout', refreshToken ? { refreshToken } : {});
    } catch {
      // offline or already expired — nothing to recover from
    }
    await clearSession();
  },

  forgotPassword: async (email: string) => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },

  verifyOtp: async (email: string, otpCode: string) => {
    const res = await apiClient.post<{ resetToken: string }>('/auth/verify-otp', {
      email,
      otpCode,
    });
    return res.data;
  },

  resetPassword: async (resetToken: string, newPassword: string) => {
    const res = await apiClient.put('/auth/reset-password', { resetToken, newPassword });
    return res.data;
  },
};
