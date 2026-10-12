import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { AdminActivity } from '../../../SHARED/src/schemas/admin.schema.js';
import { PATHS, type ContentStore, type StoredFile } from './store.js';

/*
 * Almacenamiento local (desarrollo): escribe en los archivos del proyecto. El historial de
 * acciones va a FRONTEND/.admin-local/activity.json (ignorado por git).
 */
export function createFsStore(rootDir: string): ContentStore {
  const abs = (file: string) => path.join(rootDir, ...file.split('/'));
  const activityFile = abs('FRONTEND/.admin-local/activity.json');

  async function readActivity(): Promise<AdminActivity[]> {
    try {
      return JSON.parse(await readFile(activityFile, 'utf8')) as AdminActivity[];
    } catch {
      return [];
    }
  }

  async function walk(folder: string): Promise<StoredFile[]> {
    let entries;
    try {
      entries = await readdir(abs(folder), { withFileTypes: true });
    } catch {
      return [];
    }
    const nested = await Promise.all(
      entries.map(async (entry): Promise<StoredFile[]> => {
        const file = `${folder}/${entry.name}`;
        if (entry.isDirectory()) return walk(file);
        if (!entry.isFile()) return [];
        const info = await stat(abs(file));
        return [{ path: file, size: info.size, version: String(Math.round(info.mtimeMs)) }];
      }),
    );
    return nested.flat();
  }

  /** Escritura atómica: archivo temporal y luego renombrar, para no dejar un JSON a medias. */
  async function writeAtomic(file: string, content: Buffer | string) {
    await mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.tmp`;
    await writeFile(tmp, content);
    await rename(tmp, file);
  }

  return {
    mode: 'local',
    list: walk,

    async read(file) {
      try {
        return await readFile(abs(file), 'utf8');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
        throw error;
      }
    },

    async commit(changes, message, author) {
      for (const change of changes) {
        if (change.content === null) await rm(abs(change.path), { force: true });
        else await writeAtomic(abs(change.path), change.content);
      }
      const entry: AdminActivity = { date: new Date().toISOString(), message, author: author.name };
      const history = [entry, ...(await readActivity())].slice(0, 100);
      await writeAtomic(activityFile, JSON.stringify(history, null, 2) + '\n');
    },

    async activity(limit) {
      return (await readActivity()).slice(0, limit);
    },

    async publicUrl(file) {
      // Vite sirve FRONTEND/public en la raíz: FRONTEND/public/images/x.webp → /images/x.webp
      return `${file.path.slice(PATHS.public.length)}?v=${file.version}`;
    },
  };
}
