import { useEffect } from 'react';
import i18n, { defaultLanguage } from '@/i18n';
import { lockDocumentToSpanish } from '@/lib/translate-guard';

/**
 * Título de la pestaña en el panel, aviso a los buscadores de que no lo indexen y página marcada
 * en español y "no traducir" (el traductor de Chrome hacía caer el panel).
 */
export function useAdminDocument(title: string) {
  useEffect(() => {
    document.title = `${title} · Panel Orión Lex`;
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.append(robots);
    }
    robots.content = 'noindex, nofollow';
  }, [title]);

  useEffect(() => {
    lockDocumentToSpanish();
    // Al volver a la web, el idioma elegido allí y de nuevo traducible.
    return () => {
      document.documentElement.removeAttribute('translate');
      document.documentElement.lang = i18n.resolvedLanguage ?? defaultLanguage;
    };
  }, []);
}
