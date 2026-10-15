import { useTranslation } from 'react-i18next';
import {
  approachContentSchema,
  articleContentSchema,
  blogContentSchema,
  coverageContentSchema,
  homeContentSchema,
  landingContentSchema,
  legalContentSchema,
  mattersContentSchema,
  servicesContentSchema,
  siteContentSchema,
  teamContentSchema,
  testimonialsContentSchema,
  type ArticleContent,
  type LandingContent,
  type ServicesContent,
} from '@orion-lex/shared';
import { defaultLanguage, supportedLanguages, type Language } from '@/i18n';

/*
 * Contenido editable de la web (textos e imágenes), en content/<idioma>/:
 * - un JSON por sección (site.json, home.json…),
 * - landings/<slug>.json: una landing page por servicio,
 * - articles/<slug>.json: un artículo de Actualidad Jurídica por archivo.
 * Todo se valida al cargar: si a un JSON le falta un campo, el error aparece de inmediato.
 * Cuando exista un panel de administración, solo cambia este archivo.
 */

/** Esquema de cada JSON de sección. Los tests usan esta lista para validarlos todos. */
export const sectionSchemas = {
  site: siteContentSchema,
  home: homeContentSchema,
  matters: mattersContentSchema,
  approach: approachContentSchema,
  services: servicesContentSchema,
  team: teamContentSchema,
  coverage: coverageContentSchema,
  testimonials: testimonialsContentSchema,
  blog: blogContentSchema,
  legal: legalContentSchema,
};
type SectionName = keyof typeof sectionSchemas;

const sectionFiles = import.meta.glob<unknown>('./*/*.json', { eager: true, import: 'default' });
const landingFiles = import.meta.glob<unknown>('./*/landings/*.json', {
  eager: true,
  import: 'default',
});
const articleFiles = import.meta.glob<unknown>('./*/articles/*.json', {
  eager: true,
  import: 'default',
});

/** Archivos de una carpeta del idioma, validados, con la ruta en el mensaje de error. */
function parseFolder<T>(
  files: Record<string, unknown>,
  prefix: string,
  parse: (raw: unknown) => T,
): T[] {
  return Object.entries(files)
    .filter(([path]) => path.startsWith(prefix))
    .map(([path, raw]) => {
      try {
        return parse(raw);
      } catch (error) {
        throw new Error(`Contenido inválido en ${path}: ${String(error)}`, { cause: error });
      }
    });
}

function parseSection<N extends SectionName>(language: Language, name: N) {
  const path = `./${language}/${name}.json`;
  if (!(path in sectionFiles)) throw new Error(`Falta el archivo de contenido ${path}`);
  try {
    return sectionSchemas[name].parse(sectionFiles[path]) as ReturnType<
      (typeof sectionSchemas)[N]['parse']
    >;
  } catch (error) {
    throw new Error(`Contenido inválido en ${path}: ${String(error)}`, { cause: error });
  }
}

/**
 * Áreas y servicios en otro idioma: el orden, las fotos, las URLs y lo destacado salen del español
 * (lo que edita el panel); los textos, de la traducción si existe. Lo nuevo sin traducir sale en español.
 */
function mergeServices(base: ServicesContent, translated?: ServicesContent): ServicesContent {
  if (!translated) return base;
  return {
    ...translated,
    items: base.items.map((item) => {
      const own = translated.items.find((t) => t.slug === item.slug);
      if (!own) return item;
      return {
        ...item,
        title: own.title,
        description: own.description,
        details: own.details,
        message: own.message,
        image: { ...item.image, alt: own.image.alt },
        services: item.services.map((service) => {
          const ownService = own.services.find((s) => s.slug === service.slug);
          return ownService
            ? { ...service, ...ownService, slug: service.slug, image: service.image }
            : service;
        }),
      };
    }),
  };
}

function parseContent(language: Language) {
  const site = parseSection(language, 'site');
  const matters = parseSection(language, 'matters');
  const blog = parseSection(language, 'blog');

  const parseLandings = (lang: Language) =>
    parseFolder(landingFiles, `./${lang}/landings/`, (raw) => landingContentSchema.parse(raw));
  const ownLandings = parseLandings(language);
  const baseLandings = language === defaultLanguage ? ownLandings : parseLandings(defaultLanguage);
  // El orden y las fotos salen del español (lo que edita el panel). Las landings sin traducción
  // se muestran en español: así cada URL existe en todos los idiomas.
  const order =
    language === defaultLanguage ? matters.order : parseSection(defaultLanguage, 'matters').order;
  const landings: LandingContent[] = order.map((slug) => {
    const base = baseLandings.find((l) => l.slug === slug);
    if (!base) throw new Error(`matters.json menciona "${slug}" sin landing`);
    const own = ownLandings.find((l) => l.slug === slug);
    return own ? { ...own, image: base.image } : base;
  });

  const categories = new Set(blog.categories.map((c) => c.slug));
  const parseArticles = (lang: Language) =>
    parseFolder(articleFiles, `./${lang}/articles/`, (raw) => articleContentSchema.parse(raw));
  const own = parseArticles(language);
  // Las noticias se escriben en español desde el panel: mientras no tengan traducción, los otros
  // idiomas muestran la versión española (así las URLs son las mismas en todos los idiomas).
  const untranslated =
    language === defaultLanguage
      ? []
      : parseArticles(defaultLanguage).filter((a) => !own.some((o) => o.slug === a.slug));
  const articles: ArticleContent[] = [...own, ...untranslated]
    .filter((article) => article.published)
    .map((article) => {
      if (!categories.has(article.category)) {
        throw new Error(
          `El artículo "${article.slug}" usa la categoría "${article.category}", que no está en blog.json`,
        );
      }
      return article;
    })
    // Más recientes primero.
    .sort((a, b) => b.date.localeCompare(a.date));

  return {
    site,
    home: parseSection(language, 'home'),
    matters,
    landings,
    approach: parseSection(language, 'approach'),
    services: mergeServices(
      parseSection(defaultLanguage, 'services'),
      language === defaultLanguage ? undefined : parseSection(language, 'services'),
    ),
    team: parseSection(language, 'team'),
    coverage: parseSection(language, 'coverage'),
    testimonials: parseSection(language, 'testimonials'),
    blog,
    articles,
    legal: parseSection(language, 'legal'),
  };
}

export type SiteContentBundle = ReturnType<typeof parseContent>;

const contentByLanguage = Object.fromEntries(
  supportedLanguages.map((language) => [language, parseContent(language)]),
) as Record<Language, SiteContentBundle>;

/** Contenido de un idioma (útil fuera de React, p. ej. en pruebas). */
export function getContent(language: Language): SiteContentBundle {
  return contentByLanguage[language];
}

/** Contenido en el idioma activo; se actualiza solo al cambiar de idioma. */
export function useContent(): SiteContentBundle {
  const { i18n } = useTranslation();
  const language = supportedLanguages.find((l) => l === i18n.resolvedLanguage) ?? defaultLanguage;
  return contentByLanguage[language];
}
