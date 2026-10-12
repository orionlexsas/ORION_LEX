import { useEffect } from 'react';

/** Título de la pestaña en el panel y aviso a los buscadores de que no lo indexen. */
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
}
