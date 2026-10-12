import {
  articleContentSchema,
  type ArticleContent,
} from '../../../SHARED/src/schemas/content.schema.js';
import type {
  AdminArticle,
  AdminArticleSave,
  AdminCategory,
  AdminUser,
} from '../../../SHARED/src/schemas/admin.schema.js';
import { decodeImage, EXTENSION_BY_MIME, slugify, toJsonFile, uniquePath } from './files.js';
import { HttpError, mapLimit, PATHS, type ContentStore, type FileChange } from './store.js';

/*
 * Noticias de Actualidad Jurídica: un JSON por artículo en content/es/articles/.
 * El panel edita el español. Si existe la versión en inglés (content/en/articles/), se le copian
 * los datos que no son texto (estado, fecha, categoría, imagen, URL) para que no se desincronice.
 */

const articlePath = (language: 'es' | 'en', slug: string) =>
  `${PATHS.articles(language)}/${slug}.json`;

export async function readCategories(store: ContentStore): Promise<AdminCategory[]> {
  const raw = await store.read(PATHS.blog);
  if (!raw) throw new HttpError(500, 'CONTENT_MISSING', 'No se encontró blog.json');
  const { categories } = JSON.parse(raw) as { categories: AdminCategory[] };
  return categories.map(({ slug, name }) => ({ slug, name }));
}

async function readArticle(store: ContentStore, path: string): Promise<ArticleContent | null> {
  const raw = await store.read(path);
  if (raw === null) return null;
  const parsed = articleContentSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    console.error(`Panel: ${path} no cumple el esquema y se omite`, parsed.error.issues);
    return null;
  }
  return parsed.data;
}

/** Artículos en español tal como están guardados (incluye `status`), más recientes primero. */
async function readSpanishArticles(store: ContentStore): Promise<ArticleContent[]> {
  const files = (await store.list(PATHS.articles('es'))).filter((f) => f.path.endsWith('.json'));
  const articles = await mapLimit(files, 8, (file) => readArticle(store, file.path));
  return articles
    .filter((a): a is ArticleContent => a !== null)
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

const toAdmin = ({ status: _status, ...article }: ArticleContent): AdminArticle => article;

export async function listArticles(store: ContentStore): Promise<AdminArticle[]> {
  return (await readSpanishArticles(store)).map(toAdmin);
}

/** JSON del artículo con el mismo orden de campos que los archivos escritos a mano. */
function serialize(article: ArticleContent) {
  return toJsonFile({
    slug: article.slug,
    status: article.status,
    published: article.published,
    featured: article.featured,
    title: article.title,
    category: article.category,
    date: article.date,
    excerpt: article.excerpt,
    body: article.body,
    sources: article.sources,
    image: article.image,
    seo: article.seo?.description ? article.seo : undefined,
  });
}

/** Cambios para mantener la versión en inglés (si existe) al día con los datos de la española. */
async function syncEnglish(
  store: ContentStore,
  slug: string,
  update: ((english: ArticleContent) => ArticleContent) | 'delete',
): Promise<FileChange[]> {
  const path = articlePath('en', slug);
  const english = await readArticle(store, path);
  if (!english) return [];
  if (update === 'delete') return [{ path, content: null }];
  const next = update(english);
  const changes: FileChange[] = [{ path: articlePath('en', next.slug), content: serialize(next) }];
  if (next.slug !== slug) changes.push({ path, content: null });
  return changes;
}

/** Guarda una noticia nueva (`originalSlug` null) o existente. Devuelve la noticia guardada. */
export async function saveArticle(
  store: ContentStore,
  { article, newImage }: AdminArticleSave & { article: AdminArticle },
  originalSlug: string | null,
  user: AdminUser,
): Promise<AdminArticle> {
  const categories = await readCategories(store);
  if (!categories.some((c) => c.slug === article.category)) {
    throw new HttpError(400, 'UNKNOWN_CATEGORY', 'La categoría no existe');
  }

  const existing = await readSpanishArticles(store);
  const previous = originalSlug ? existing.find((a) => a.slug === originalSlug) : undefined;
  if (originalSlug && !previous) throw new HttpError(404, 'NOT_FOUND', 'La noticia no existe');
  if (article.slug !== originalSlug && existing.some((a) => a.slug === article.slug)) {
    throw new HttpError(409, 'SLUG_TAKEN', 'Ya existe una noticia con esa dirección (URL)');
  }

  const changes: FileChange[] = [];
  let image = article.image;
  if (newImage) {
    const folder = `${PATHS.images}/actualidad`;
    const taken = new Set((await store.list(folder)).map((f) => f.path));
    const path = uniquePath(
      folder,
      slugify(newImage.fileName),
      EXTENSION_BY_MIME[newImage.mime],
      taken,
    );
    changes.push({ path, content: decodeImage(newImage.data, newImage.mime) });
    image = {
      src: path.slice(PATHS.public.length),
      alt: newImage.alt || article.image?.alt || article.title,
    };
  }

  // Lo que se edita desde el panel queda aprobado por el despacho.
  const saved: ArticleContent = { ...article, image, status: 'final' };
  changes.push({ path: articlePath('es', saved.slug), content: serialize(saved) });
  if (originalSlug && originalSlug !== saved.slug) {
    changes.push({ path: articlePath('es', originalSlug), content: null });
  }
  if (originalSlug) {
    changes.push(
      ...(await syncEnglish(store, originalSlug, (english) => ({
        ...english,
        slug: saved.slug,
        published: saved.published,
        featured: saved.featured,
        category: saved.category,
        date: saved.date,
        image: saved.image && { ...saved.image, alt: english.image?.alt ?? saved.image.alt },
      }))),
    );
  }

  // Solo una noticia puede ser "la de la semana": se le quita la marca a la anterior.
  if (saved.featured) {
    for (const other of existing) {
      if (!other.featured || other.slug === originalSlug || other.slug === saved.slug) continue;
      changes.push({
        path: articlePath('es', other.slug),
        content: serialize({ ...other, featured: false }),
      });
      changes.push(
        ...(await syncEnglish(store, other.slug, (english) => ({ ...english, featured: false }))),
      );
    }
  }

  const title = `«${saved.title}»`;
  let message = `Se editó la noticia ${title}`;
  if (!previous)
    message = saved.published ? `Se publicó la noticia ${title}` : `Se creó el borrador ${title}`;
  else if (!previous.published && saved.published) message = `Se publicó la noticia ${title}`;
  else if (previous.published && !saved.published)
    message = `Se pasó a borrador la noticia ${title}`;

  await store.commit(changes, message, user);
  return toAdmin(saved);
}

export async function deleteArticle(store: ContentStore, slug: string, user: AdminUser) {
  const article = await readArticle(store, articlePath('es', slug));
  if (!article) throw new HttpError(404, 'NOT_FOUND', 'La noticia no existe');
  const changes: FileChange[] = [
    { path: articlePath('es', slug), content: null },
    ...(await syncEnglish(store, slug, 'delete')),
  ];
  await store.commit(changes, `Se eliminó la noticia «${article.title}»`, user);
}
