import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storage';
import { WeightUnit } from '../utils/format';
import { settingsApi, ServerSettings } from '../api/settings';
import { authApi } from '../api/auth';
import { onSessionChange } from '../api/client';
import i18n, { AppLanguage, DEFAULT_LANGUAGE, setAppLanguage } from '../i18n';

/**
 * Every user preference that is not auth: what the "Cài đặt chung" (08d),
 * "Mục tiêu tuần" (08c) and "Onboarding" (01e) screens write, plus the theme
 * and language shown in "Hồ sơ" (08a).
 *
 * The server owns these (`/me/settings`), so they survive reinstalling the app
 * or switching device. AsyncStorage is kept as an offline cache: it is what the
 * UI renders before the network answers and what it falls back to when there is
 * no connection.
 */
export interface AppSettings {
  weightUnit: WeightUnit;
  /** Play a sound when the rest timer ends. */
  restSoundEnabled: boolean;
  /** Vibrate when moving to the next set. */
  vibrationEnabled: boolean;
  /** Keep the screen awake during an active workout. */
  keepAwake: boolean;
  /** Push a reminder 30 minutes before a scheduled session. */
  reminderEnabled: boolean;
  /** Default rest between sets, in seconds. */
  restSeconds: number;
  /** Target sessions per week. */
  weeklyGoal: number;
  /** Preferred training days, 0 = Sunday. */
  preferredDays: number[];
  /** Offer schedule suggestions based on preferred days. */
  autoSchedule: boolean;
  /** Onboarding answers (01e). */
  goal: 'muscle' | 'fat_loss' | 'endurance';
  level: 'beginner' | 'intermediate' | 'advanced';
  onboardingCompleted: boolean;
  /**
   * Theme and language are rendered by ThemeContext and i18n, which keep their
   * own AsyncStorage copy so the very first frame is already correct. This is
   * the account-level copy that follows the user to another device; the two are
   * reconciled in ThemeProvider and in the language effect below.
   */
  theme: 'dark' | 'light';
  language: AppLanguage;
  /**
   * Body metrics from "Chỉnh sửa hồ sơ" (08b). These live on the user record,
   * not in settings, and are written through `authApi.updateProfile`.
   */
  bodyWeightKg?: number;
  heightCm?: number;
  birthday?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  weightUnit: 'kg',
  restSoundEnabled: true,
  vibrationEnabled: true,
  keepAwake: true,
  reminderEnabled: true,
  restSeconds: 90,
  weeklyGoal: 3,
  preferredDays: [1, 3, 5],
  autoSchedule: false,
  goal: 'muscle',
  level: 'beginner',
  onboardingCompleted: false,
  theme: 'dark',
  language: DEFAULT_LANGUAGE,
};

const fromServer = (remote: ServerSettings): Partial<AppSettings> => ({
  weightUnit: remote.weightUnit,
  restSoundEnabled: remote.soundEnabled,
  vibrationEnabled: remote.vibrationEnabled,
  keepAwake: remote.keepScreenOn,
  reminderEnabled: remote.notificationsEnabled,
  restSeconds: remote.restTimerSeconds,
  weeklyGoal: remote.weeklyGoal,
  preferredDays: remote.preferredDays,
  autoSchedule: remote.autoSchedule,
  goal: remote.goal,
  level: remote.level,
  onboardingCompleted: remote.onboardingCompleted,
  // The column allows 'system', which this app has no UI for. Treat it as the
  // product default rather than inventing a third mode the user cannot pick.
  theme: remote.theme === 'light' ? 'light' : 'dark',
  language: remote.language === 'en' ? 'en' : 'vi',
});

/** Only the fields the server owns; body metrics are deliberately excluded. */
const toServer = (patch: Partial<AppSettings>): Partial<ServerSettings> => {
  const out: Partial<ServerSettings> = {};
  if (patch.weightUnit !== undefined) out.weightUnit = patch.weightUnit as ServerSettings['weightUnit'];
  if (patch.restSoundEnabled !== undefined) out.soundEnabled = patch.restSoundEnabled;
  if (patch.vibrationEnabled !== undefined) out.vibrationEnabled = patch.vibrationEnabled;
  if (patch.keepAwake !== undefined) out.keepScreenOn = patch.keepAwake;
  if (patch.reminderEnabled !== undefined) out.notificationsEnabled = patch.reminderEnabled;
  if (patch.restSeconds !== undefined) out.restTimerSeconds = patch.restSeconds;
  if (patch.weeklyGoal !== undefined) out.weeklyGoal = patch.weeklyGoal;
  if (patch.preferredDays !== undefined) out.preferredDays = patch.preferredDays;
  if (patch.autoSchedule !== undefined) out.autoSchedule = patch.autoSchedule;
  if (patch.goal !== undefined) out.goal = patch.goal;
  if (patch.level !== undefined) out.level = patch.level;
  if (patch.onboardingCompleted !== undefined) out.onboardingCompleted = patch.onboardingCompleted;
  if (patch.theme !== undefined) out.theme = patch.theme;
  if (patch.language !== undefined) out.language = patch.language;
  return out;
};

interface SettingsContextValue {
  settings: AppSettings;
  isReady: boolean;
  /** `/me/settings` has answered at least once for the current session. */
  isServerSynced: boolean;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  /** Switches the app language and records it on the account. */
  setLanguage: (language: AppLanguage) => Promise<void>;
  resetSettings: () => Promise<void>;
  /** Pull the server copy again, e.g. right after signing in. */
  syncFromServer: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  isReady: false,
  isServerSynced: false,
  updateSettings: async () => {},
  setLanguage: async () => {},
  resetSettings: async () => {},
  syncFromServer: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isReady, setIsReady] = useState(false);
  /**
   * True once `/me/settings` has actually answered. Theme and language are the
   * only preferences that also live outside this context, so they need the
   * distinction: at boot the device copy wins (it is what the first frame
   * already painted), and the account copy only takes over once it has really
   * arrived. Without this a fresh install would flip a user who chose light
   * mode back to the `DEFAULT_SETTINGS` dark while still offline.
   */
  const [isServerSynced, setServerSynced] = useState(false);
  const latest = useRef(DEFAULT_SETTINGS);

  const persistLocally = useCallback((next: AppSettings) => {
    latest.current = next;
    AsyncStorage.setItem(STORAGE_KEYS.appSettings, JSON.stringify(next)).catch(() => {});
  }, []);

  const syncFromServer = useCallback(async () => {
    if (!(await authApi.isAuthenticated())) return;
    try {
      const remote = await settingsApi.get();
      setSettings((prev) => {
        const next = { ...prev, ...fromServer(remote) };
        persistLocally(next);
        return next;
      });
      setServerSynced(true);
    } catch {
      // offline or the request failed — the cached copy stays authoritative
    }
  }, [persistLocally]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.appSettings);
        if (raw) {
          const parsed = JSON.parse(raw);
          const merged = { ...DEFAULT_SETTINGS, ...parsed };
          setSettings(merged);
          latest.current = merged;
        }
      } catch {
        // corrupted blob — fall back to defaults rather than crashing at boot
      } finally {
        // Render from cache immediately; the server copy lands a moment later.
        setIsReady(true);
      }
      await syncFromServer();
    })();
  }, [syncFromServer]);

  /**
   * The provider outlives sign-in and sign-out (it sits above the navigator),
   * so it has to follow the session by hand. Signing out drops the previous
   * account's preferences instead of leaving them on screen for the next one;
   * signing in pulls that account's own copy, which is the only moment a login
   * on a fresh device gets its server-side settings.
   */
  useEffect(
    () =>
      onSessionChange(async (event) => {
        if (event === 'signed-out') {
          setSettings(DEFAULT_SETTINGS);
          latest.current = DEFAULT_SETTINGS;
          setServerSynced(false);
          await AsyncStorage.removeItem(STORAGE_KEYS.appSettings).catch(() => {});
        } else {
          await syncFromServer();
        }
      }),
    [syncFromServer]
  );

  const updateSettings = useCallback(
    async (patch: Partial<AppSettings>) => {
      const next = { ...latest.current, ...patch };
      setSettings(next);
      persistLocally(next);

      const remotePatch = toServer(patch);
      if (Object.keys(remotePatch).length === 0) return;

      try {
        await settingsApi.update(remotePatch);
      } catch {
        // The local write already happened, so a toggle never feels stuck. The
        // next successful sync reconciles it.
      }
    },
    [persistLocally]
  );

  const setLanguage = useCallback(
    async (language: AppLanguage) => {
      await setAppLanguage(language);
      await updateSettings({ language });
    },
    [updateSettings]
  );

  /**
   * Pulls the account's language down onto this device — the case that matters
   * is signing in on a new phone, where i18n booted from an empty AsyncStorage
   * and would otherwise stay on the Vietnamese default.
   */
  useEffect(() => {
    if (!isServerSynced) return;
    // i18n reports region-tagged codes such as `vi-VN`; compare the base only.
    const active: AppLanguage = i18n.language?.startsWith('en') ? 'en' : 'vi';
    if (settings.language === active) return;
    setAppLanguage(settings.language).catch(() => {});
  }, [isServerSynced, settings.language]);

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    latest.current = DEFAULT_SETTINGS;
    await AsyncStorage.removeItem(STORAGE_KEYS.appSettings);
    try {
      await settingsApi.update(toServer(DEFAULT_SETTINGS));
    } catch {
      // best effort
    }
  }, []);

  const value = useMemo(
    () => ({
      settings,
      isReady,
      isServerSynced,
      updateSettings,
      setLanguage,
      resetSettings,
      syncFromServer,
    }),
    [settings, isReady, isServerSynced, updateSettings, setLanguage, resetSettings, syncFromServer]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => useContext(SettingsContext);
