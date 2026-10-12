import type {
  AdminUser,
  MediaItem,
  MediaReplace,
  MediaUpload,
  MediaUsage,
} from '../../../SHARED/src/schemas/admin.schema.js';
import { decodeImage, EXTENSION_BY_MIME, isImage, slugify, uniquePath } from './files.js';
import { HttpError, mapLimit, PATHS, type ContentStore } from './store.js';

/*
 * Biblioteca de imágenes: todo lo que hay en FRONTEND/public/images/<carpeta>/.
 * Para saber dónde se usa cada imagen se busca su ruta (/images/…) en los JSON de contenido.
 */

const SECTION_LABELS: Record<string, string> = {
  site: 'Datos del sitio (vista previa en redes)',
  home: 'Portada · banner principal',
  matters: 'Asuntos que atendemos',
  approach: 'Cómo trabajamos',
  services: 'Servicios jurídicos',
  team: 'Equipo',
  coverage: 'Cobertura nacional',
  blog: 'Actualidad Jurídica',
  legal: 'Páginas legales',
};

/** "es/articles/x.json" → "Noticia: <título>" */
export function usageLabel(relative: string, text: string): string {
  const [, kind, name = ''] = relative.split('/');
  const title = () => {
    try {
      return (JSON.parse(text) as { title?: string }).title ?? name;
    } catch {
      return name;
    }
  };
  if (kind === 'articles') return `Noticia: ${title()}`;
  if (kind === 'landings') return `Página de servicio: ${title()}`;
  return SECTION_LABELS[kind?.replace(/\.json$/, '') ?? ''] ?? relative;
}

/** Devuelve una función que dice dónde se usa una imagen (/images/…). */
async function loadUsageIndex(store: ContentStore) {
  const files = (await store.list(PATHS.content)).filter((f) => f.path.endsWith('.json'));
  const contents = await mapLimit(files, 8, async (file) => {
    const relative = file.path.slice(PATHS.content.length + 1);
    const text = (await store.read(file.path)) ?? '';
    return { relative, text, label: usageLabel(relative, text) };
  });

  return (src: string): MediaUsage[] => {
    const needle = `"${src}"`;
    const found = contents.filter((c) => c.text.includes(needle));
    const spanish = found.filter((c) => c.relative.startsWith('es/'));
    // Se muestran los usos en español; los de inglés solo si la imagen no se usa en español.
    const shown =
      spanish.length > 0 ? spanish : found.map((c) => ({ ...c, label: `Inglés · ${c.label}` }));
    return shown.map((c) => ({ file: c.relative, label: c.label }));
  };
}

const toSrc = (path: string) => path.slice(PATHS.public.length);

export async function listMedia(store: ContentStore): Promise<MediaItem[]> {
  const [files, usagesOf] = await Promise.all([store.list(PATHS.images), loadUsageIndex(store)]);
  const images = files.filter((f) => isImage(f.path));
  const items = await Promise.all(
    images.map(async (file): Promise<MediaItem> => {
      const src = toSrc(file.path);
      const parts = src.split('/');
      return {
        src,
        url: await store.publicUrl(file),
        // /images/hero/x.webp → hero; /images/x.jpg → general
        folder: parts.length > 3 ? parts[2]! : 'general',
        name: parts.at(-1)!,
        size: file.size,
        usages: usagesOf(src),
      };
    }),
  );
  return items.sort((a, b) => a.folder.localeCompare(b.folder) || a.name.localeCompare(b.name));
}

export async function uploadMedia(store: ContentStore, input: MediaUpload, user: AdminUser) {
  const data = decodeImage(input.data, input.mime);
  const folder = `${PATHS.images}/${input.folder}`;
  const taken = new Set((await store.list(folder)).map((f) => f.path));
  const path = uniquePath(folder, slugify(input.fileName), EXTENSION_BY_MIME[input.mime], taken);
  const name = path.split('/').at(-1)!;
  await store.commit([{ path, content: data }], `Se subió la imagen «${name}»`, user);
  return { src: toSrc(path) };
}

async function findImage(store: ContentStore, src: string) {
  const path = `${PATHS.public}${src}`;
  const exists = (await store.list(PATHS.images)).some((f) => f.path === path);
  if (!exists) throw new HttpError(404, 'NOT_FOUND', 'La imagen no existe');
  return path;
}

/** Cambia el archivo sin cambiar su ruta: se actualiza en todos los lugares donde se usa. */
export async function replaceMedia(store: ContentStore, input: MediaReplace, user: AdminUser) {
  const path = await findImage(store, input.src);
  const extension = /\.[a-z]+$/i.exec(path)?.[0].toLowerCase().replace('.jpeg', '.jpg');
  if (extension !== EXTENSION_BY_MIME[input.mime]) {
    throw new HttpError(
      400,
      'FORMAT_MISMATCH',
      'La imagen nueva debe tener el mismo formato que la anterior',
    );
  }
  const data = decodeImage(input.data, input.mime);
  await store.commit(
    [{ path, content: data }],
    `Se reemplazó la imagen «${path.split('/').at(-1)}»`,
    user,
  );
  return { src: input.src };
}

export async function deleteMedia(store: ContentStore, src: string, user: AdminUser) {
  const path = await findImage(store, src);
  const usages = (await loadUsageIndex(store))(src);
  if (usages.length > 0) {
    throw new HttpError(409, 'IMAGE_IN_USE', 'La imagen está en uso en la web', usages);
  }
  await store.commit(
    [{ path, content: null }],
    `Se eliminó la imagen «${path.split('/').at(-1)}»`,
    user,
  );
}
