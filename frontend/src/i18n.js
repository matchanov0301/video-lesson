import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import WebApp from '@twa-dev/sdk';

import uzLatn from './locales/uz-latn/translation.json';
import uzCyrl from './locales/uz-cyrl/translation.json';

const resources = {
  'uz-latn': { translation: uzLatn },
  'uz-cyrl': { translation: uzCyrl }
};

// Intercept WebApp language code
let defaultLang = 'uz-latn';
try {
  if (WebApp.initDataUnsafe?.user?.language_code === 'uz-cyrl') {
    defaultLang = 'uz-cyrl';
  }
} catch (e) {
  // ignore
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: defaultLang,
    debug: true,
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
