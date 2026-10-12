import type { ImageMime } from '@orion-lex/shared';

/*
 * Prepara una foto elegida en el navegador antes de subirla desde el panel: la reduce a un
 * ancho máximo y la convierte (WebP por defecto, el formato del sitio). Así una foto del celular
 * de 6 MB queda en unos cientos de KB y cabe en el límite de Vercel.
 */

export interface PreparedImage {
  fileName: string;
  mime: ImageMime;
  /** Contenido en base64, sin el prefijo data: */
  data: string;
  /** Para mostrarla en el panel antes de guardar. */
  previewUrl: string;
  width: number;
  height: number;
  size: number;
}

/** Tamaño máximo después de convertir (la función de Vercel acepta hasta 4,5 MB en base64). */
const MAX_BYTES = 2.5 * 1024 * 1024;

export class ImageFileError extends Error {}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(new ImageFileError('No se pudo leer la imagen'));
    reader.readAsDataURL(blob);
  });
}

export async function prepareImage(
  file: File,
  { maxWidth = 1920, mime = 'image/webp' as ImageMime, quality = 0.85 } = {},
): Promise<PreparedImage> {
  if (!file.type.startsWith('image/')) throw new ImageFileError('El archivo no es una imagen');

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ImageFileError('No se pudo abrir la imagen. Prueba con JPG, PNG o WebP.');
  }
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new ImageFileError('Tu navegador no puede procesar imágenes');
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
  if (!blob || blob.type !== mime)
    throw new ImageFileError('Tu navegador no pudo convertir la imagen');
  if (blob.size > MAX_BYTES) throw new ImageFileError('La imagen es demasiado pesada aun reducida');

  return {
    fileName: file.name,
    mime,
    data: await blobToBase64(blob),
    previewUrl: URL.createObjectURL(blob),
    width,
    height,
    size: blob.size,
  };
}

/** Formato de una ruta de imagen según su extensión (para reemplazarla con el mismo). */
export function mimeFromPath(path: string): ImageMime {
  if (/\.jpe?g$/i.test(path)) return 'image/jpeg';
  if (/\.png$/i.test(path)) return 'image/png';
  return 'image/webp';
}
