import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import vi from './locales/vi.json';
import { STORAGE_KEYS } from './constants/storage';

export const SUPPORTED_LANGUAGES = ['vi', 'en'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** The product is Vietnamese-first, matching the design file. */
export const DEFAULT_LANGUAGE: AppLanguage = 'vi';

const resources = {
  en: { translation: (en as any).translation || en },
  vi: { translation: (vi as any).translation || vi },
};

i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  compatibilityJSON: 'v4',
  interpolation: { escapeValue: false },
});

/** Restores the saved language on boot. Awaited by App before first render. */
export const loadSavedLanguage = async () => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.language);
    if (saved && (SUPPORTED_LANGUAGES as readonly string[]).includes(saved)) {
      await i18n.changeLanguage(saved);
    }
  } catch {
    // keep the default language if storage is unavailable
  }
};

/** Single entry point for changing language so persistence can never drift. */
export const setAppLanguage = async (language: AppLanguage) => {
  await i18n.changeLanguage(language);
  await AsyncStorage.setItem(STORAGE_KEYS.language, language).catch(() => {});
};

export default i18n;
