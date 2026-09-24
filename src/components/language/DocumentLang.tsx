import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function DocumentLang() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set document language attribute
    document.documentElement.lang = i18n.language;

    // Set document direction based on language
    if (i18n.language === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [i18n.language]);

  return null;
}