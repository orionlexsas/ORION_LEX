import type { ImageMime } from '../../../SHARED/src/schemas/admin.schema.js';
import { HttpError } from './store.js';

/** Utilidades de archivos compartidas por noticias e imágenes. */

export const EXTENSION_BY_MIME: Record<ImageMime, string> = {
  'image/webp': '.webp',
  'image/jpeg': '.jpg',
  'image/png': '.png',
};

const IMAGE_EXTENSIONS = /\.(webp|jpe?g|png|avif|gif|svg)$/i;
export const isImage = (path: string) => IMAGE_EXTENSIONS.test(path);

/** Tipo real del archivo según sus primeros bytes (no se confía en lo que dice el navegador). */
function sniffMime(data: Buffer): ImageMime | null {
  if (
    data.subarray(0, 4).toString('latin1') === 'RIFF' &&
    data.subarray(8, 12).toString('latin1') === 'WEBP'
  ) {
    return 'image/webp';
  }
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return 'image/jpeg';
  if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png';
  }
  return null;
}

/** Decodifica la imagen y comprueba que de verdad sea del formato declarado. */
export function decodeImage(base64: string, mime: ImageMime): Buffer {
  const data = Buffer.from(base64, 'base64');
  if (data.length === 0 || sniffMime(data) !== mime) {
    throw new HttpError(400, 'INVALID_IMAGE', 'El archivo no es una imagen válida');
  }
  return data;
}

/** "Foto Señora Justicia (1).JPG" → "foto-senora-justicia-1" */
export function slugify(value: string): string {
  return (
    value
      .replace(/\.[a-z0-9]+$/i, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'imagen'
  );
}

/** Nombre libre dentro de una carpeta: foto.webp, foto-2.webp, foto-3.webp… */
export function uniquePath(folder: string, base: string, extension: string, taken: Set<string>) {
  let candidate = `${folder}/${base}${extension}`;
  for (let n = 2; taken.has(candidate); n++) candidate = `${folder}/${base}-${n}${extension}`;
  return candidate;
}

export const toJsonFile = (value: unknown) => Buffer.from(JSON.stringify(value, null, 2) + '\n');
