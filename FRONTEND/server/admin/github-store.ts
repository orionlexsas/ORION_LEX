import type { AdminActivity } from '../../../SHARED/src/schemas/admin.schema.js';
import { HttpError, PATHS, type ContentStore, type StoredFile } from './store.js';

/*
 * Almacenamiento en producción: cada guardado del panel es un commit en la rama de GitHub
 * (main). Vercel ve el commit y republica la web sola. Usa la API REST de GitHub con un token
 * de acceso (permiso "Contents: read and write" solo sobre este repositorio).
 */

export interface GithubStoreOptions {
  token: string;
  /** dueño/repositorio, p. ej. orionlexsas/ORION_LEX */
  repo: string;
  branch: string;
  fetch?: typeof fetch;
}

/** Los commits del panel empiezan así; el historial de acciones se arma con ellos. */
const COMMIT_PREFIX = 'Panel: ';

interface TreeEntry {
  path: string;
  type: 'blob' | 'tree' | 'commit';
  sha: string;
  size?: number;
}

export function createGithubStore({
  token,
  repo,
  branch,
  fetch: fetchImpl = fetch,
}: GithubStoreOptions): ContentStore {
  // Una instancia por petición: el árbol se lee una vez y se reutiliza.
  let snapshot: Promise<{ commit: string; files: Map<string, StoredFile> }> | null = null;

  async function github<T>(
    path: string,
    init?: RequestInit & { raw?: boolean; binary?: boolean },
  ): Promise<T> {
    const res = await fetchImpl(`https://api.github.com/repos/${repo}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept:
          init?.raw || init?.binary
            ? 'application/vnd.github.raw+json'
            : 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'orion-lex-panel',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error(`GitHub ${init?.method ?? 'GET'} ${path} → ${res.status} ${detail}`);
      if (res.status === 401 || res.status === 403) {
        throw new HttpError(
          503,
          'STORAGE_AUTH_FAILED',
          'El token de GitHub no es válido o no tiene permisos',
        );
      }
      throw new HttpError(502, 'STORAGE_ERROR', `GitHub respondió ${res.status}`, {
        status: res.status,
      });
    }
    if (init?.binary) return Buffer.from(await res.arrayBuffer()) as T;
    return (init?.raw ? await res.text() : await res.json()) as T;
  }

  const headCommit = async () =>
    (await github<{ object: { sha: string } }>(`/git/ref/heads/${branch}`)).object.sha;

  function loadSnapshot() {
    snapshot ??= (async () => {
      const commit = await headCommit();
      const tree = await github<{ tree: TreeEntry[]; truncated: boolean }>(
        `/git/trees/${commit}?recursive=1`,
      );
      const files = new Map<string, StoredFile>();
      for (const entry of tree.tree) {
        if (entry.type === 'blob') {
          files.set(entry.path, { path: entry.path, size: entry.size ?? 0, version: entry.sha });
        }
      }
      return { commit, files };
    })();
    // Si falla, el siguiente intento vuelve a pedirlo.
    snapshot.catch(() => (snapshot = null));
    return snapshot;
  }

  async function createCommit(
    changes: { path: string; content: Buffer | null }[],
    message: string,
  ) {
    const parent = await headCommit();
    const { tree: baseTree } = await github<{ tree: { sha: string } }>(`/git/commits/${parent}`);

    const tree = await Promise.all(
      changes.map(async (change) => {
        if (change.content === null) {
          return { path: change.path, mode: '100644', type: 'blob', sha: null };
        }
        const blob = await github<{ sha: string }>('/git/blobs', {
          method: 'POST',
          body: JSON.stringify({ content: change.content.toString('base64'), encoding: 'base64' }),
        });
        return { path: change.path, mode: '100644', type: 'blob', sha: blob.sha };
      }),
    );

    const newTree = await github<{ sha: string }>('/git/trees', {
      method: 'POST',
      body: JSON.stringify({ base_tree: baseTree.sha, tree }),
    });
    const commit = await github<{ sha: string }>('/git/commits', {
      method: 'POST',
      body: JSON.stringify({ message, tree: newTree.sha, parents: [parent] }),
    });
    // Sin force: si alguien cambió la rama mientras tanto, GitHub lo rechaza y se reintenta.
    await github(`/git/refs/heads/${branch}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha, force: false }),
    });
  }

  return {
    mode: 'github',

    async list(folder) {
      const { files } = await loadSnapshot();
      const prefix = `${folder}/`;
      return [...files.values()].filter((file) => file.path.startsWith(prefix));
    },

    async read(path) {
      const { commit, files } = await loadSnapshot();
      if (!files.has(path)) return null;
      return github<string>(`/contents/${encodeURI(path)}?ref=${commit}`, { raw: true });
    },

    async commit(changes, message, author) {
      const fullMessage = `${COMMIT_PREFIX}${message}\n\nHecho desde el panel por ${author.name} <${author.email}>`;
      try {
        await createCommit(changes, fullMessage);
      } catch (error) {
        // 422 = la rama avanzó mientras se armaba el commit: se intenta una vez más sobre la nueva.
        if (error instanceof HttpError && (error.details as { status?: number })?.status === 422) {
          await createCommit(changes, fullMessage);
        } else {
          throw error;
        }
      }
      snapshot = null;
    },

    async activity(limit) {
      const commits = await github<{ commit: { message: string; author: { date: string } } }[]>(
        `/commits?sha=${branch}&per_page=50`,
      );
      return commits
        .filter((c) => c.commit.message.startsWith(COMMIT_PREFIX))
        .slice(0, limit)
        .map((c): AdminActivity => {
          const [title = '', ...rest] = c.commit.message.split('\n');
          const author = /por (.+?) </.exec(rest.join('\n'))?.[1] ?? 'Panel';
          return { date: c.commit.author.date, message: title.slice(COMMIT_PREFIX.length), author };
        });
    },

    async readBinary(file) {
      // Por el sha del archivo (blob): siempre la versión exacta, sin depender de la rama.
      return github<Buffer>(`/git/blobs/${file.version}`, { binary: true });
    },

    async publicUrl(file) {
      // El repositorio es privado: el panel pide la imagen a su propia API, que la trae de GitHub
      // con el token. Así se ve al instante, aunque Vercel aún no haya republicado la web.
      const src = file.path.slice(PATHS.public.length);
      return `/api/v1/admin/media/file?src=${encodeURIComponent(src)}&v=${file.version}`;
    },
  };
}
