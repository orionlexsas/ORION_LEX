import { useEffect } from 'react';
import { useContent } from '@/content';
import { absoluteUrl, type PageSeo } from './pages';

/** Crea (si no existe) y actualiza una etiqueta <meta> o <link> del <head>. */
function setHeadTag(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let element = document.head.querySelector<HTMLElement>(selector);
  if (!element) {
    element = create();
    document.head.appendChild(element);
  }
  element.setAttribute(attr, value);
}

const meta = (key: 'name' | 'property', name: string, content: string) =>
  setHeadTag(
    `meta[${key}="${name}"]`,
    () => {
      const el = document.createElement('meta');
      el.setAttribute(key, name);
      return el;
    },
    'content',
    content,
  );

/**
 * Título, descripción, canonical y Open Graph de la página actual. El HTML inicial ya los trae
 * (prerender del build, para buscadores y redes); este hook los actualiza al navegar.
 */
export function useSeo(seo: PageSeo | undefined) {
  const { site } = useContent();
  // Campos sueltos: el objeto `seo` se crea en cada render y no sirve como dependencia.
  const { path, title, description, image, type } = seo ?? {};

  useEffect(() => {
    if (!path || !title || !description) return;
    const url = absoluteUrl(site.siteUrl, path);
    const imageUrl = absoluteUrl(site.siteUrl, image ?? site.seo.image);

    document.title = title;
    meta('name', 'description', description);
    setHeadTag(
      'link[rel="canonical"]',
      () => {
        const el = document.createElement('link');
        el.rel = 'canonical';
        return el;
      },
      'href',
      url,
    );
    meta('property', 'og:title', title);
    meta('property', 'og:description', description);
    meta('property', 'og:url', url);
    meta('property', 'og:image', imageUrl);
    meta('property', 'og:type', type ?? 'website');
    meta('name', 'twitter:card', 'summary_large_image');
  }, [path, title, description, image, type, site]);
}
