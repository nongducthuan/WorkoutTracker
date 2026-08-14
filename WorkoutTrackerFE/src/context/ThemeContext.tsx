import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme, ThemeColors } from '../theme/colors';
import { STORAGE_KEYS } from '../constants/storage';
import { useSettings } from './SettingsContext';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'dark',
  isDark: true,
  colors: darkTheme,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

/**
 * The device copy in AsyncStorage stays the boot-time source of truth: it is
 * read synchronously enough to avoid a dark-to-light flash, and it works
 * offline and on the login screen where there is no account yet.
 *
 * `settings.theme` is the same preference stored against the account. It takes
 * over only once the server has actually answered (`isServerSynced`), which is
 * what makes the choice follow the user to a second device instead of being
 * lost with the install.
 *
 * Must be mounted inside `SettingsProvider`. Outside it, `useSettings` yields
 * the inert default context and this degrades to the old local-only behaviour.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const { settings, isServerSynced, updateSettings } = useSettings();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.themeMode).then((saved) => {
      if (saved === 'light' || saved === 'dark') setThemeModeState(saved);
    });
  }, []);

  useEffect(() => {
    if (!isServerSynced) return;
    setThemeModeState((current) => {
      if (current === settings.theme) return current;
      AsyncStorage.setItem(STORAGE_KEYS.themeMode, settings.theme).catch(() => {});
      return settings.theme;
    });
  }, [isServerSynced, settings.theme]);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setThemeModeState(mode);
      AsyncStorage.setItem(STORAGE_KEYS.themeMode, mode).catch(() => {});
      // Fire and forget: the context already swallows a failed write, and the
      // next sync reconciles it.
      updateSettings({ theme: mode });
    },
    [updateSettings]
  );

  const toggleTheme = useCallback(
    () => setThemeMode(themeMode === 'dark' ? 'light' : 'dark'),
    [themeMode, setThemeMode]
  );

  const value = useMemo<ThemeContextType>(
    () => ({
      themeMode,
      isDark: themeMode === 'dark',
      colors: themeMode === 'light' ? lightTheme : darkTheme,
      toggleTheme,
      setThemeMode,
    }),
    [themeMode, toggleTheme, setThemeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
