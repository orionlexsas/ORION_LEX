import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Colección guardada en un archivo JSON. Pensado solo para desarrollo o volúmenes pequeños.
 * - Los cambios se ejecutan en cola, para que dos peticiones simultáneas no se pisen.
 * - Cada escritura va a un archivo temporal y luego se renombra, para no dejar el JSON a medias.
 */
export function createJsonFileStore<T>(filePath: string) {
  let queue: Promise<unknown> = Promise.resolve();

  async function readAll(): Promise<T[]> {
    try {
      return JSON.parse(await readFile(filePath, 'utf8')) as T[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }
  }

  async function writeAll(items: T[]) {
    await mkdir(path.dirname(filePath), { recursive: true });
    const tmp = `${filePath}.tmp`;
    await writeFile(tmp, JSON.stringify(items, null, 2) + '\n', 'utf8');
    await rename(tmp, filePath);
  }

  return {
    readAll,
    update(change: (items: T[]) => T[]): Promise<void> {
      const run = queue.then(async () => writeAll(change(await readAll())));
      queue = run.catch(() => undefined);
      return run;
    },
  };
}
