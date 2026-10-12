import { createLoginLimiter } from './auth.js';
import { createFsStore } from './fs-store.js';
import { createGithubStore } from './github-store.js';
import type { AdminDeps } from './handler.js';

/*
 * Arma las dependencias del panel a partir de las variables de entorno (ver FRONTEND/.env.example):
 *   ADMIN_EMAIL, ADMIN_NAME, ADMIN_ROLE (opcional), ADMIN_PASSWORD_HASH, ADMIN_SESSION_SECRET
 *   Producción: GITHUB_TOKEN, GITHUB_REPO (orionlexsas/ORION_LEX), GITHUB_BRANCH (main)
 * Con GITHUB_TOKEN se guarda en GitHub; sin él, en el disco (`rootDir`, solo en local).
 */

type Env = Record<string, string | undefined>;

// Un solo contador de intentos por proceso (en Vercel, por instancia de la función).
const limiter = createLoginLimiter();

export function createAdminDeps(
  env: Env,
  options: { rootDir?: string; secureCookies: boolean },
): AdminDeps {
  const { ADMIN_EMAIL, ADMIN_NAME, ADMIN_ROLE, ADMIN_PASSWORD_HASH, ADMIN_SESSION_SECRET } = env;
  const { GITHUB_TOKEN, GITHUB_REPO = 'orionlexsas/ORION_LEX', GITHUB_BRANCH = 'main' } = env;

  let store: AdminDeps['store'] = null;
  if (GITHUB_TOKEN)
    store = createGithubStore({ token: GITHUB_TOKEN, repo: GITHUB_REPO, branch: GITHUB_BRANCH });
  else if (options.rootDir) store = createFsStore(options.rootDir);

  const secret =
    ADMIN_SESSION_SECRET && ADMIN_SESSION_SECRET.length >= 32 ? ADMIN_SESSION_SECRET : null;
  if (ADMIN_SESSION_SECRET && !secret)
    console.error('Panel: ADMIN_SESSION_SECRET debe tener 32 caracteres o más');

  return {
    store,
    auth: {
      user:
        ADMIN_EMAIL && ADMIN_PASSWORD_HASH
          ? {
              email: ADMIN_EMAIL.trim().toLowerCase(),
              name: ADMIN_NAME?.trim() || 'Administrador',
              role: ADMIN_ROLE?.trim() || 'Administrador',
              passwordHash: ADMIN_PASSWORD_HASH.trim(),
            }
          : null,
      secret,
    },
    limiter,
    secureCookies: options.secureCookies,
  };
}
