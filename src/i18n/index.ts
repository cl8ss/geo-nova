import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from './locales/en';
import ar from './locales/ar';

// Get language from localStorage or default to English
const getStoredLanguage = () => {
  const stored = localStorage.getItem('geo-nova-lang');
  if (stored === 'en' || stored === 'ar') return stored;
  return 'en'; // default to English
};

i18n
  .use(initReactI18next)
  .init({
    lng: getStoredLanguage(),
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false // React already escapes
    },
    resources: {
      en: { translation: en },
      ar: { translation: ar }
    }
  });

export default i18n;