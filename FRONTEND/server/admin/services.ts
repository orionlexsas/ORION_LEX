import {
  landingContentSchema,
  mattersContentSchema,
  servicesContentSchema,
  type LandingContent,
  type ServicesContent,
} from '../../../SHARED/src/schemas/content.schema.js';
import type {
  AdminAreasSave,
  AdminLandingInput,
  AdminServicesResponse,
  AdminUser,
} from '../../../SHARED/src/schemas/admin.schema.js';
import { toJsonFile } from './files.js';
import { HttpError, mapLimit, PATHS, type ContentStore, type FileChange } from './store.js';

/*
 * Servicios de la web, editables desde el panel:
 * - Áreas (categorías) con sus servicios: content/es/services.json → /servicios/<área>/<servicio>.
 * - Asuntos frecuentes (landings para anuncios): content/es/landings/<slug>.json → /<slug>,
 *   en el orden de matters.json (que se mantiene igual en todos los idiomas).
 * Las traducciones al inglés, si existen, conservan sus textos (ver content/index.ts).
 */

const LANGUAGES = ['es', 'en'] as const;
const servicesPath = `${PATHS.content}/es/services.json`;
const mattersPath = (language: string) => `${PATHS.content}/${language}/matters.json`;
const landingPath = (language: string, slug: string) =>
  `${PATHS.content}/${language}/landings/${slug}.json`;

/**
 * Direcciones que ya usa la web: un asunto frecuente (que vive en /<slug>) no puede llamarse así.
 */
const RESERVED_SLUGS = new Set([
  'servicios',
  'nosotros',
  'actualidad',
  'contacto',
  'privacidad',
  'terminos',
  'admin',
  'api',
  'images',
  'brand',
  'panel',
  'assets',
  'video',
  'index',
  '404',
  'sitemap',
  'robots',
]);

async function readJson<T>(store: ContentStore, path: string): Promise<T> {
  const raw = await store.read(path);
  if (raw === null) throw new HttpError(500, 'CONTENT_MISSING', `No se encontró ${path}`);
  return JSON.parse(raw) as T;
}

async function readLanding(store: ContentStore, language: string, slug: string) {
  const raw = await store.read(landingPath(language, slug));
  return raw === null ? null : landingContentSchema.parse(JSON.parse(raw));
}

export async function readServices(store: ContentStore): Promise<AdminServicesResponse> {
  const [areas, matters] = await Promise.all([
    readJson<unknown>(store, servicesPath).then((raw) => servicesContentSchema.parse(raw)),
    readJson<unknown>(store, mattersPath('es')).then((raw) => mattersContentSchema.parse(raw)),
  ]);
  const landings = await mapLimit(matters.order, 6, async (slug) => {
    const landing = await readLanding(store, 'es', slug);
    if (!landing) throw new HttpError(500, 'CONTENT_MISSING', `Falta la página de "${slug}"`);
    return landing;
  });
  return { areas, landings };
}

const duplicate = (slugs: string[]) => slugs.find((slug, i) => slugs.indexOf(slug) !== i);

/** Qué cambió entre la lista anterior y la nueva, para el historial ("Se creó el servicio «X»"). */
function describeAreasChange(before: ServicesContent['items'], after: ServicesContent['items']) {
  const name = (title: string) => `«${title}»`;
  for (const area of after) {
    const old = before.find((a) => a.slug === area.slug);
    if (!old) return `Se creó la categoría ${name(area.title)}`;
    for (const service of area.services) {
      if (!old.services.some((s) => s.slug === service.slug)) {
        return `Se creó el servicio ${name(service.title)} en ${name(area.title)}`;
      }
    }
    const removed = old.services.find((s) => !area.services.some((n) => n.slug === s.slug));
    if (removed) return `Se eliminó el servicio ${name(removed.title)} de ${name(area.title)}`;
  }
  const removedArea = before.find((a) => !after.some((n) => n.slug === a.slug));
  if (removedArea) return `Se eliminó la categoría ${name(removedArea.title)}`;
  const order = (items: ServicesContent['items']) => items.map((a) => a.slug).join(',');
  if (order(before) !== order(after)) return 'Se cambió el orden de las categorías de servicios';
  return 'Se editaron las categorías y servicios';
}

/** Guarda la lista completa de áreas (categorías) y sus servicios. */
export async function saveAreas(store: ContentStore, input: AdminAreasSave, user: AdminUser) {
  const raw = await readJson<Record<string, unknown>>(store, servicesPath);
  const before = servicesContentSchema.parse(raw).items;
  // Lo editado desde el panel queda aprobado; se valida el archivo completo.
  const parsed = servicesContentSchema.safeParse({
    ...raw,
    items: input.items.map((item) => ({
      ...item,
      status: 'final',
      services: (item.services ?? []).map((s) => ({ ...s, status: 'final' })),
    })),
  });
  if (!parsed.success) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.issues);
  }
  const { items } = parsed.data;

  const repeatedArea = duplicate(items.map((i) => i.slug));
  if (repeatedArea) {
    throw new HttpError(409, 'SLUG_TAKEN', `Dos categorías tienen la misma URL: "${repeatedArea}"`);
  }
  for (const item of items) {
    const repeated = duplicate(item.services.map((s) => s.slug));
    if (repeated) {
      throw new HttpError(
        409,
        'SLUG_TAKEN',
        `En "${item.title}" dos servicios tienen la misma URL: "${repeated}"`,
      );
    }
  }
  if (items.filter((i) => i.featured).length > 1) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Solo puede haber una categoría destacada');
  }

  await store.commit(
    [{ path: servicesPath, content: toJsonFile(parsed.data) }],
    describeAreasChange(before, items),
    user,
  );
  return parsed.data;
}

async function writeOrder(store: ContentStore, order: string[]): Promise<FileChange[]> {
  return mapLimit([...LANGUAGES], 2, async (language) => {
    const matters = await readJson<Record<string, unknown>>(store, mattersPath(language));
    return { path: mattersPath(language), content: toJsonFile({ ...matters, order }) };
  });
}

/** Crea (originalSlug null) o edita un asunto frecuente. */
export async function saveLanding(
  store: ContentStore,
  input: AdminLandingInput,
  originalSlug: string | null,
  user: AdminUser,
): Promise<LandingContent> {
  const parsed = landingContentSchema.safeParse({ ...input, status: 'final' });
  if (!parsed.success) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.issues);
  }
  const landing = parsed.data;
  const { order } = mattersContentSchema.parse(await readJson(store, mattersPath('es')));

  if (originalSlug && !order.includes(originalSlug)) {
    throw new HttpError(404, 'NOT_FOUND', 'El asunto no existe');
  }
  if (landing.slug !== originalSlug) {
    if (RESERVED_SLUGS.has(landing.slug)) {
      throw new HttpError(409, 'SLUG_RESERVED', `La URL "/${landing.slug}" ya la usa otra página`);
    }
    if (order.includes(landing.slug)) {
      throw new HttpError(409, 'SLUG_TAKEN', 'Ya existe un asunto con esa URL');
    }
  }

  const changes: FileChange[] = [
    { path: landingPath('es', landing.slug), content: toJsonFile(landing) },
  ];
  let newOrder = order;
  if (!originalSlug) newOrder = [...order, landing.slug];
  else if (originalSlug !== landing.slug) {
    newOrder = order.map((slug) => (slug === originalSlug ? landing.slug : slug));
    changes.push({ path: landingPath('es', originalSlug), content: null });
    // La traducción (si existe) se mueve a la URL nueva conservando sus textos.
    const english = await readLanding(store, 'en', originalSlug);
    if (english) {
      changes.push(
        { path: landingPath('en', originalSlug), content: null },
        {
          path: landingPath('en', landing.slug),
          content: toJsonFile({ ...english, slug: landing.slug }),
        },
      );
    }
  }
  if (newOrder !== order) changes.push(...(await writeOrder(store, newOrder)));

  const action = originalSlug ? 'Se editó' : 'Se creó';
  await store.commit(changes, `${action} el asunto frecuente «${landing.title}»`, user);
  return landing;
}

export async function deleteLanding(store: ContentStore, slug: string, user: AdminUser) {
  const { order } = mattersContentSchema.parse(await readJson(store, mattersPath('es')));
  if (!order.includes(slug)) throw new HttpError(404, 'NOT_FOUND', 'El asunto no existe');
  if (order.length === 1) {
    throw new HttpError(400, 'LAST_ITEM', 'Debe quedar al menos un asunto frecuente');
  }
  const landing = await readLanding(store, 'es', slug);
  const changes: FileChange[] = [
    { path: landingPath('es', slug), content: null },
    ...(await writeOrder(
      store,
      order.filter((s) => s !== slug),
    )),
  ];
  if (await store.read(landingPath('en', slug))) {
    changes.push({ path: landingPath('en', slug), content: null });
  }
  await store.commit(changes, `Se eliminó el asunto frecuente «${landing?.title ?? slug}»`, user);
}

export async function reorderLandings(store: ContentStore, order: string[], user: AdminUser) {
  const current = mattersContentSchema.parse(await readJson(store, mattersPath('es'))).order;
  const same =
    order.length === current.length && [...order].sort().join() === [...current].sort().join();
  if (!same) throw new HttpError(400, 'VALIDATION_ERROR', 'El orden no coincide con los asuntos');
  await store.commit(
    await writeOrder(store, order),
    'Se cambió el orden de los asuntos frecuentes',
    user,
  );
}
