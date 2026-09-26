import type { SiteContentBundle } from '@/content';

/** Datos de SEO de una página. Los usan las páginas (useSeo) y el prerender del build. */
export interface PageSeo {
  path: string;
  title: string;
  description: string;
  /** Ruta de la imagen para compartir (Open Graph); si falta, la del sitio. */
  image?: string;
  type?: 'website' | 'article';
  /** Fecha de publicación (artículos). */
  publishedTime?: string;
}

/** SEO de cada página, en un solo lugar. */
export const seoFor = {
  home: (c: SiteContentBundle): PageSeo => ({
    path: '/',
    title: c.site.seo.title,
    description: c.site.seo.description,
  }),
  services: (c: SiteContentBundle): PageSeo => ({ path: '/servicios', ...c.site.pages.services }),
  about: (c: SiteContentBundle): PageSeo => ({ path: '/nosotros', ...c.site.pages.about }),
  blog: (c: SiteContentBundle): PageSeo => ({ path: '/actualidad', ...c.site.pages.blog }),
  contact: (c: SiteContentBundle): PageSeo => ({ path: '/contacto', ...c.site.pages.contact }),
  privacy: (c: SiteContentBundle): PageSeo => ({
    path: '/privacidad',
    title: `${c.legal.privacy.title} | ${c.site.brand.name}`,
    description: c.legal.privacy.description,
  }),
  terms: (c: SiteContentBundle): PageSeo => ({
    path: '/terminos',
    title: `${c.legal.terms.title} | ${c.site.brand.name}`,
    description: c.legal.terms.description,
  }),
  practiceArea: (c: SiteContentBundle, slug: string): PageSeo | undefined => {
    const item = c.services.items.find((i) => i.slug === slug);
    return (
      item && {
        path: `/servicios/${item.slug}`,
        title: `${item.title} | ${c.site.brand.name}`,
        description: `${item.description} ${item.details}`,
        image: item.image.src,
      }
    );
  },
  landing: (c: SiteContentBundle, slug: string): PageSeo | undefined => {
    const landing = c.landings.find((l) => l.slug === slug);
    return (
      landing && {
        path: `/${landing.slug}`,
        ...landing.seo,
        image: landing.image?.src,
      }
    );
  },
  article: (c: SiteContentBundle, slug: string): PageSeo | undefined => {
    const article = c.articles.find((a) => a.slug === slug);
    return (
      article && {
        path: `/actualidad/${article.slug}`,
        title: `${article.title} | ${c.site.brand.name}`,
        description: article.seo?.description ?? article.excerpt,
        image: article.image?.src,
        type: 'article',
        publishedTime: article.date,
      }
    );
  },
};

/** Todas las páginas públicas indexables (prerender del build y sitemap). */
export function allPages(c: SiteContentBundle): PageSeo[] {
  return [
    seoFor.home(c),
    seoFor.services(c),
    seoFor.about(c),
    seoFor.blog(c),
    seoFor.contact(c),
    seoFor.privacy(c),
    seoFor.terms(c),
    ...c.landings.map((l) => seoFor.landing(c, l.slug)!),
    ...c.services.items.map((i) => seoFor.practiceArea(c, i.slug)!),
    ...c.articles.map((a) => seoFor.article(c, a.slug)!),
  ];
}

/** URL absoluta a partir de una ruta del sitio. */
export const absoluteUrl = (siteUrl: string, path: string) =>
  path.startsWith('http') ? path : `${siteUrl}${path === '/' ? '' : path}`;
