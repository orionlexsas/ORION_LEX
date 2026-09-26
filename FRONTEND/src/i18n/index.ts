import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';

export const supportedLanguages = ['es', 'en'] as const;
export type Language = (typeof supportedLanguages)[number];
export const defaultLanguage: Language = 'es';

export const resources = {
  es: { translation: es },
  en: { translation: en },
} as const;

/** Mantiene <html lang> en el idioma activo (el título y la descripción los pone cada página). */
function syncDocument() {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = i18n.resolvedLanguage ?? defaultLanguage;
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: defaultLanguage,
    supportedLngs: supportedLanguages,
    load: 'languageOnly',
    interpolation: { escapeValue: false }, // React ya escapa el contenido
    detection: {
      // Español por defecto; solo cambia si se elige (queda guardado) o con ?lang=en en la URL.
      order: ['querystring', 'localStorage'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'orion-lex-lang',
      caches: ['localStorage'],
    },
  })
  .then(syncDocument);

i18n.on('languageChanged', syncDocument);

export default i18n;
