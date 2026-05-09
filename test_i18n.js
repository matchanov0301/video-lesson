const i18next = require('i18next');
const uzLatn = require('./frontend/src/locales/uz-latn/translation.json');
const uzCyrl = require('./frontend/src/locales/uz-cyrl/translation.json');

const resources = {
  'uz-latn': { translation: uzLatn },
  'uz-cyrl': { translation: uzCyrl }
};

i18next.init({
  resources,
  fallbackLng: 'uz-latn',
  debug: true
}).then(() => {
  console.log('Test home (uz-latn):', i18next.t('home'));
  console.log('Test search_placeholder (uz-latn):', i18next.t('search_placeholder'));
  
  i18next.changeLanguage('uz-cyrl').then(() => {
    console.log('Test home (uz-cyrl):', i18next.t('home'));
    console.log('Test search_placeholder (uz-cyrl):', i18next.t('search_placeholder'));
  });
});
