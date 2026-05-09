import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import WebApp from '@twa-dev/sdk';

import uzLatn from './locales/uz-latn/translation.js';
import uzCyrl from './locales/uz-cyrl/translation.js';

// Since we are importing pure JS objects, no default wrapper check is needed
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

// Safely access localStorage to prevent Telegram WebApp SecurityErrors
let savedLang = null;
try {
  savedLang = localStorage.getItem('i18nextLng');
} catch (e) {
  console.warn("localStorage not available:", e);
}
const initialLang = (savedLang === 'uz-latn' || savedLang === 'uz-cyrl') ? savedLang : defaultLang;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang, // Force exact language
    fallbackLng: 'uz-latn', // Strict fallback to our primary locale
    supportedLngs: ['uz-latn', 'uz-cyrl'], // Disallow any other languages like "ru" or "en"
    defaultNS: 'translation',
    ns: ['translation'],
    debug: true,
    interpolation: {
      escapeValue: false 
    }
  });

// Save to localStorage when language changes via LanguageSwitcher
i18n.on('languageChanged', (lng) => {
  if (lng === 'uz-latn' || lng === 'uz-cyrl') {
    try {
      localStorage.setItem('i18nextLng', lng);
    } catch (e) {
      console.warn("Could not save language to localStorage:", e);
    }
  }
});

export default i18n;
