import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:8080';

export const AUTH_TOKEN_KEY = 'workout_tracker_auth_token';
export const REFRESH_TOKEN_KEY = 'workout_tracker_refresh_token';
export const AUTH_USER_KEY = 'pulse_user';

export const apiClient = axios.create({
  baseURL: API_URL,
  // Without a timeout a dead backend leaves the app on an endless spinner
  // instead of surfacing the "Mất kết nối" screen (design 11).
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const isMockMode = false;

let navigateToLogin: () => void = () => {};

export const setNavigateToLogin = (navigateFn: () => void) => {
  navigateToLogin = navigateFn;
};

/**
 * `signed-out` fires on every way out of a session — the logout button, a
 * password change, and a refresh token the server refused. `signed-in` fires
 * once a login or register has stored a token.
 *
 * Anything holding data belonging to *the account* rather than *the device*
 * (the react-query cache, the settings context, per-workout drafts) subscribes
 * here. Without it the next account to sign in on this phone reads the previous
 * one's cache until every query has refetched.
 */
export type SessionEvent = 'signed-in' | 'signed-out';

type SessionListener = (event: SessionEvent) => void | Promise<void>;

const sessionListeners = new Set<SessionListener>();

/** Returns the unsubscribe function, for use in a `useEffect` cleanup. */
export const onSessionChange = (listener: SessionListener) => {
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
};

export const emitSessionChange = async (event: SessionEvent) => {
  for (const listener of [...sessionListeners]) {
    try {
      await listener(event);
    } catch {
      // one bad listener must not stop the others from cleaning up
    }
  }
};

export const clearSession = async () => {
  // Emit only when a session was actually torn down. Clearing the query cache
  // makes every mounted screen refetch at once; those requests now carry no
  // token, so each 401 lands back here. Without this guard that second pass
  // would clear the cache again and the two would keep feeding each other
  // until the navigator finally unmounts the screens.
  const hadSession = !!(await AsyncStorage.getItem(AUTH_TOKEN_KEY));
  await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, AUTH_USER_KEY]);
  if (hadSession) await emitSessionChange('signed-out');
};

/** The API answers with `{ code, message }`; `code` is the stable identifier. */
export interface ApiErrorBody {
  code?: string;
  message?: string;
}

export const errorCodeOf = (error: unknown): string | undefined =>
  (error as AxiosError<ApiErrorBody>)?.response?.data?.code;

export const errorMessageOf = (error: unknown): string | undefined =>
  (error as AxiosError<ApiErrorBody>)?.response?.data?.message;

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Access tokens are short lived, so a 401 is the normal end of their life rather
 * than a sign the user was signed out. Exchange the refresh token once and
 * replay the request; only a failed exchange sends the user back to login.
 *
 * Concurrent 401s share a single refresh call — otherwise every in-flight
 * request would rotate the token and invalidate the others.
 */
let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  try {
    // A bare axios call: apiClient would recurse through this interceptor.
    const res = await axios.post(
      `${API_URL}/auth/refresh`,
      { refreshToken },
      { timeout: 12000, headers: { 'Content-Type': 'application/json' } }
    );
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, res.data.token);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, res.data.refreshToken);
    if (res.data.user) {
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data.user));
    }
    return res.data.token as string;
  } catch {
    return null;
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retried?: boolean };

    const isAuthEndpoint =
      original?.url?.includes('/auth/login') ||
      original?.url?.includes('/auth/register') ||
      original?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && original && !original._retried && !isAuthEndpoint) {
      original._retried = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }

      await clearSession();
      navigateToLogin();
    }

    return Promise.reject(error);
  }
);
