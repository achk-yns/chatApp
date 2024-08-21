import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './src/core/locales/en.json';
import fr from './src/core/locales/fr.json'
import ar from './src/core/locales/ar.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    ar: { translation: ar },
  },
  lng: 'en',  // default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,  // react already safes from xss
  },
});

export default i18n;
