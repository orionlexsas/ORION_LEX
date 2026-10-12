import type { AdminActivity, AdminUser } from '../../../SHARED/src/schemas/admin.schema.js';

/*
 * Dónde guarda el panel sus cambios. La web lee su contenido de archivos del repositorio
 * (JSON en src/content e imágenes en public/images), así que el panel edita esos mismos archivos:
 * - en local (fs-store): directamente en el disco; Vite recarga la web al instante;
 * - en Vercel (github-store): con un commit en GitHub; Vercel republica la web en 1–2 minutos.
 * Las rutas son relativas a la raíz del monorepo (ORION_LEX/), p. ej. FRONTEND/public/images/x.webp
 */

export const PATHS = {
  content: 'FRONTEND/src/content',
  articles: (language: 'es' | 'en') => `FRONTEND/src/content/${language}/articles`,
  blog: 'FRONTEND/src/content/es/blog.json',
  home: 'FRONTEND/src/content/es/home.json',
  /** Carpeta pública: /images/x.webp se guarda en FRONTEND/public/images/x.webp */
  public: 'FRONTEND/public',
  images: 'FRONTEND/public/images',
} as const;

export interface StoredFile {
  path: string;
  size: number;
  /** Cambia cuando cambia el archivo (sirve para que el navegador no muestre la versión vieja). */
  version: string;
}

/** Un archivo a escribir; `content: null` lo borra. */
export interface FileChange {
  path: string;
  content: Buffer | null;
}

export interface ContentStore {
  readonly mode: 'local' | 'github';
  /** Archivos bajo una carpeta (recursivo). */
  list(folder: string): Promise<StoredFile[]>;
  /** Texto de un archivo, o null si no existe. */
  read(path: string): Promise<string | null>;
  /** Aplica varios cambios juntos y los registra en el historial. */
  commit(changes: FileChange[], message: string, author: AdminUser): Promise<void>;
  /** Últimos cambios hechos desde el panel, más recientes primero. */
  activity(limit: number): Promise<AdminActivity[]>;
  /** URL con la que el panel muestra un archivo de FRONTEND/public (p. ej. /images/x.webp). */
  publicUrl(file: StoredFile): Promise<string>;
}

/** Error esperado que la API devuelve con su código HTTP (mismo formato ApiError de SHARED). */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/** Ejecuta tareas asíncronas con un máximo de `limit` a la vez (para no saturar la API de GitHub). */
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await task(items[index]!);
    }
  });
  await Promise.all(workers);
  return results;
}
