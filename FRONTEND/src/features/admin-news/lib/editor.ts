import type { AdminArticle, AdminArticleSave } from '@orion-lex/shared';
import type { PreparedImage } from '@/lib/image-file';
import { todayIso } from '@/lib/format';

/** Estado del formulario del editor de noticias. */
export interface ArticleDraft {
  slug: string;
  /** false mientras la URL se genere sola a partir del título (noticia nueva). */
  slugTouched: boolean;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  date: string;
  published: boolean;
  featured: boolean;
  image: {
    src: string | null;
    previewUrl: string | null;
    alt: string;
    upload: PreparedImage | null;
  };
  seoDescription: string;
  sources: { label: string; url: string }[];
}

/** "¿Cuánto dura un reporte?" → "cuanto-dura-un-reporte" */
export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function draftFrom(
  article: AdminArticle | undefined,
  defaultCategory: string,
): ArticleDraft {
  return {
    slug: article?.slug ?? '',
    slugTouched: !!article,
    title: article?.title ?? '',
    excerpt: article?.excerpt ?? '',
    body: article?.body ?? '',
    category: article?.category ?? defaultCategory,
    date: article?.date ?? todayIso(),
    published: article?.published ?? false,
    featured: article?.featured ?? false,
    image: {
      src: article?.image?.src ?? null,
      previewUrl: article?.image?.src ?? null,
      alt: article?.image?.alt ?? '',
      upload: null,
    },
    seoDescription: article?.seo?.description ?? '',
    sources: article?.sources.map((s) => ({ ...s })) ?? [],
  };
}

/** Datos que se envían a la API. `published` permite "Publicar" o "Pasar a borrador". */
export function toPayload(draft: ArticleDraft, published: boolean): AdminArticleSave {
  const { image } = draft;
  return {
    article: {
      slug: draft.slug,
      published,
      featured: draft.featured,
      title: draft.title,
      category: draft.category,
      date: draft.date,
      excerpt: draft.excerpt,
      body: draft.body,
      sources: draft.sources.filter((s) => s.label.trim() || s.url.trim()),
      image: !image.upload && image.src ? { src: image.src, alt: image.alt.trim() } : undefined,
      seo: draft.seoDescription.trim() ? { description: draft.seoDescription.trim() } : undefined,
    },
    newImage: image.upload
      ? {
          fileName: draft.slug || image.upload.fileName,
          mime: image.upload.mime,
          data: image.upload.data,
          alt: image.alt.trim(),
        }
      : undefined,
  };
}
