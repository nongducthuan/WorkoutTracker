import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';

import en from './locales/en.json';
import vi from './locales/vi.json';

const resources = {
  en: { translation: en.translation || en },
  vi: { translation: vi.translation || vi },
};

const initI18n = async () => {
  let language = 'en';
  try {
    const savedLang = await SecureStore.getItemAsync('pulse_language');
    if (savedLang) {
      language = savedLang;
    }
  } catch (e) {
    // ignore
  }

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: language,
      fallbackLng: 'en',
      compatibilityJSON: 'v4',
      interpolation: {
        escapeValue: false,
      },
    });
};

initI18n();

export default i18n;
