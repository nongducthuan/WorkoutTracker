import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, darkTheme, lightTheme, ThemeColors } from '../theme/colors';

import { updateGlobalStyles } from '../theme/styles';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const THEME_STORAGE_KEY = '@themeMode';

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'dark',
  isDark: true,
  colors: darkTheme,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedTheme) => {
      if (savedTheme === 'light' || savedTheme === 'dark') {
        const theme = savedTheme === 'light' ? lightTheme : darkTheme;
        setThemeModeState(savedTheme);
        Object.assign(Colors, theme);
        updateGlobalStyles(theme);
      }
    });
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    const theme = mode === 'light' ? lightTheme : darkTheme;
    setThemeModeState(mode);
    Object.assign(Colors, theme);
    updateGlobalStyles(theme);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  const toggleTheme = () => {
    const nextMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
  };

  const currentColors = themeMode === 'light' ? lightTheme : darkTheme;
  const isDark = themeMode === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDark,
        colors: currentColors,
        toggleTheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
