import 'i18next';
import type es from './locales/es.json';

// Claves de traducción con tipos: t('clave.inexistente') da error al compilar.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof es };
  }
}
