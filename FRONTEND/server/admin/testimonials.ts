import { testimonialsContentSchema } from '../../../SHARED/src/schemas/content.schema.js';
import type {
  AdminTestimonial,
  AdminTestimonialsResponse,
  AdminTestimonialsSave,
  AdminUser,
} from '../../../SHARED/src/schemas/admin.schema.js';
import { toJsonFile } from './files.js';
import { HttpError, PATHS, type ContentStore, type FileChange } from './store.js';

/*
 * Testimonios de la portada ("Lo que dicen nuestros clientes"): content/<idioma>/testimonials.json.
 * El panel edita la lista en español. En inglés se conservan los textos ya traducidos (por
 * nombre); un testimonio nuevo aparece en inglés con su texto en español hasta que se traduzca.
 */

const path = (language: 'es' | 'en') => `${PATHS.content}/${language}/testimonials.json`;

async function readFile(store: ContentStore, language: 'es' | 'en') {
  const raw = await store.read(path(language));
  if (raw === null) return null;
  return JSON.parse(raw) as Record<string, unknown> & { items: AdminTestimonial[] };
}

export async function listTestimonials(store: ContentStore): Promise<AdminTestimonialsResponse> {
  const file = await readFile(store, 'es');
  if (!file) throw new HttpError(500, 'CONTENT_MISSING', 'No se encontró testimonials.json');
  const { items } = testimonialsContentSchema.parse(file);
  return { items };
}

/** Qué cambió, para el historial del panel ("Se agregó el testimonio de X"). */
function describe(before: AdminTestimonial[], after: AdminTestimonial[]) {
  const added = after.find((t) => !before.some((b) => b.name === t.name));
  if (added) return `Se agregó el testimonio de «${added.name}»`;
  const removed = before.find((b) => !after.some((t) => t.name === b.name));
  if (removed) return `Se eliminó el testimonio de «${removed.name}»`;
  const order = (list: AdminTestimonial[]) => list.map((t) => t.name).join('|');
  if (order(before) !== order(after)) return 'Se cambió el orden de los testimonios';
  return 'Se editaron los testimonios';
}

/** Guarda la lista completa (orden incluido) y mantiene la versión en inglés al día. */
export async function saveTestimonials(
  store: ContentStore,
  { items }: AdminTestimonialsSave,
  user: AdminUser,
): Promise<AdminTestimonialsResponse> {
  const names = items.map((t) => t.name.toLowerCase());
  const repeated = names.find((n, i) => names.indexOf(n) !== i);
  if (repeated) {
    throw new HttpError(409, 'DUPLICATE', 'Hay dos testimonios con el mismo nombre');
  }

  const spanish = await readFile(store, 'es');
  if (!spanish) throw new HttpError(500, 'CONTENT_MISSING', 'No se encontró testimonials.json');
  const before = testimonialsContentSchema.parse(spanish).items;
  const nextSpanish = testimonialsContentSchema.parse({ ...spanish, items });

  const changes: FileChange[] = [{ path: path('es'), content: toJsonFile(nextSpanish) }];

  const english = await readFile(store, 'en');
  if (english) {
    const translated = new Map(english.items.map((t) => [t.name, t]));
    const nextEnglish = testimonialsContentSchema.parse({
      ...english,
      items: items.map((t) => {
        const old = translated.get(t.name);
        // Si el texto en español no cambió, se queda la traducción; si cambió, se usa el nuevo.
        const unchanged = before.find((b) => b.name === t.name && b.text === t.text);
        return old && unchanged ? old : t;
      }),
    });
    changes.push({ path: path('en'), content: toJsonFile(nextEnglish) });
  }

  await store.commit(changes, describe(before, items), user);
  return { items: nextSpanish.items };
}
