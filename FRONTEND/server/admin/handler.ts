import type { ZodType } from 'zod';
import type { ApiError } from '../../../SHARED/src/api.js';
import {
  adminArticleSaveSchema,
  adminAreasSaveSchema,
  adminLandingSaveSchema,
  adminLoginSchema,
  adminMattersOrderSchema,
  imageTextsSaveSchema,
  mediaReplaceSchema,
  mediaUploadSchema,
  type AdminArticlesResponse,
  type AdminOverview,
  type AdminUser,
} from '../../../SHARED/src/schemas/admin.schema.js';
import { deleteArticle, listArticles, readCategories, saveArticle } from './articles.js';
import {
  clearSessionCookie,
  createSessionToken,
  DUMMY_HASH,
  parseCookies,
  readSessionToken,
  SESSION_COOKIE,
  sessionCookie,
  verifyPassword,
  type LoginLimiter,
} from './auth.js';
import { deleteMedia, listMedia, replaceMedia, uploadMedia } from './media.js';
import { findImageTexts, saveImageTexts } from './media-texts.js';
import { computeStats } from './stats.js';
import {
  deleteLanding,
  readServices,
  reorderLandings,
  saveAreas,
  saveLanding,
} from './services.js';
import { HttpError, PATHS, type ContentStore } from './store.js';

/*
 * API del panel: /api/v1/admin/*. No depende de Vercel ni de Vite: recibe la petición ya
 * leída y devuelve código, cuerpo y cookie. La usan la función de Vercel (api/v1/admin.ts) y,
 * en desarrollo, el servidor de Vite (vite.config.ts). Se prueba en handler.test.ts.
 */

export interface AdminDeps {
  /** null si falta configurar dónde guardar (en Vercel: GITHUB_TOKEN). */
  store: ContentStore | null;
  auth: {
    user: (AdminUser & { passwordHash: string }) | null;
    secret: string | null;
  };
  limiter: LoginLimiter;
  /** Cookies con Secure (solo HTTPS). En local se desactiva. */
  secureCookies: boolean;
  now?: () => Date;
}

export interface AdminRequest {
  method: string;
  /** Ruta después de /api/v1/admin, p. ej. /articles/mi-noticia */
  path: string;
  query: URLSearchParams;
  body: unknown;
  cookieHeader?: string;
  ip: string;
}

export interface AdminResponse {
  status: number;
  /** JSON, o un Buffer para archivos (imágenes). */
  body?: unknown;
  setCookie?: string;
  /** Solo para archivos binarios. */
  contentType?: string;
  cacheControl?: string;
}

const ok = (body: unknown, status = 200): AdminResponse => ({ status, body });

function parseBody<T>(schema: ZodType<T>, raw: unknown): T {
  let body = raw;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      throw new HttpError(400, 'INVALID_JSON', 'El cuerpo no es JSON válido');
    }
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    throw new HttpError(400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.issues);
  return parsed.data;
}

async function login(req: AdminRequest, deps: AdminDeps, now: Date): Promise<AdminResponse> {
  const { user, secret } = deps.auth;
  if (!user || !secret) {
    throw new HttpError(503, 'ADMIN_NOT_CONFIGURED', 'El acceso al panel no está configurado');
  }
  if (deps.limiter.isBlocked(req.ip, now.getTime())) {
    throw new HttpError(429, 'TOO_MANY_ATTEMPTS', 'Demasiados intentos. Espera 15 minutos.');
  }

  const { email, password, remember } = parseBody(adminLoginSchema, req.body);
  const sameEmail = email === user.email.toLowerCase();
  // Se compara la contraseña aunque el correo no coincida: tarda lo mismo y no revela cuál falló.
  const validPassword = await verifyPassword(password, sameEmail ? user.passwordHash : DUMMY_HASH);
  if (!sameEmail || !validPassword) {
    deps.limiter.fail(req.ip, now.getTime());
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Correo o contraseña incorrectos');
  }

  deps.limiter.reset(req.ip);
  const profile: AdminUser = { email: user.email, name: user.name, role: user.role };
  const { token, maxAge } = createSessionToken(profile, secret, remember, now);
  return {
    status: 200,
    body: { user: profile },
    setCookie: sessionCookie(token, remember ? maxAge : null, deps.secureCookies),
  };
}

/** Usuario con sesión válida (y que siga siendo la cuenta configurada), o null. */
function currentUser(req: AdminRequest, deps: AdminDeps, now: Date): AdminUser | null {
  const { user, secret } = deps.auth;
  const session = secret
    ? readSessionToken(parseCookies(req.cookieHeader)[SESSION_COOKIE], secret, now)
    : null;
  return session && user && session.email === user.email ? session : null;
}

function requireUser(req: AdminRequest, deps: AdminDeps, now: Date): AdminUser {
  const user = currentUser(req, deps, now);
  if (!user) throw new HttpError(401, 'UNAUTHORIZED', 'Inicia sesión para continuar');
  return user;
}

function requireStore(deps: AdminDeps): ContentStore {
  if (!deps.store) {
    throw new HttpError(
      503,
      'STORAGE_NOT_CONFIGURED',
      'Falta configurar dónde guarda el panel (GITHUB_TOKEN)',
    );
  }
  return deps.store;
}

const CONTENT_TYPES: Record<string, string> = {
  webp: 'image/webp',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  avif: 'image/avif',
  gif: 'image/gif',
};

/** Imagen de la biblioteca servida por la API (el repositorio es privado). Solo con sesión. */
async function mediaFile(store: ContentStore, src: string | null): Promise<AdminResponse> {
  const extension = /\.([a-z]+)$/i.exec(src ?? '')?.[1]?.toLowerCase() ?? '';
  if (
    !src ||
    !/^\/images\/[a-z0-9/._-]+$/i.test(src) ||
    src.includes('..') ||
    !CONTENT_TYPES[extension]
  ) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Imagen inválida');
  }
  const path = `${PATHS.public}${src}`;
  const file = (await store.list(PATHS.images)).find((f) => f.path === path);
  const data = file ? await store.readBinary(file) : null;
  if (!data) throw new HttpError(404, 'NOT_FOUND', 'La imagen no existe');
  return {
    status: 200,
    body: data,
    contentType: CONTENT_TYPES[extension],
    // La URL lleva la versión del archivo (?v=): se puede guardar en caché sin miedo.
    cacheControl: 'private, max-age=31536000, immutable',
  };
}

async function overview(store: ContentStore, now: Date): Promise<AdminOverview> {
  const [articles, categories, media, activity, homeRaw] = await Promise.all([
    listArticles(store),
    readCategories(store),
    listMedia(store),
    store.activity(5),
    store.read(PATHS.home),
  ]);
  const published = articles.filter((a) => a.published);
  const month = now.toISOString().slice(0, 7);
  const hero = (JSON.parse(homeRaw ?? '{}') as { hero?: { title: string; image: { src: string } } })
    .hero;
  const heroImage = media.find((m) => m.src === hero?.image.src);

  return {
    stats: {
      published: published.length,
      publishedThisMonth: published.filter((a) => a.date.startsWith(month)).length,
      drafts: articles.length - published.length,
      images: media.length,
      imagesInUse: media.filter((m) => m.usages.length > 0).length,
      lastPublished: published[0]?.date ?? null,
    },
    latestArticles: articles.slice(0, 5),
    categories,
    activity,
    hero: { title: hero?.title ?? '', image: heroImage?.url ?? hero?.image.src ?? '' },
    mode: store.mode,
  };
}

async function route(req: AdminRequest, deps: AdminDeps): Promise<AdminResponse> {
  const now = deps.now?.() ?? new Date();
  const { method } = req;
  const [resource = '', id, ...extra] = req.path.split('/').filter(Boolean).map(decodeURIComponent);
  if (extra.length > 0) throw new HttpError(404, 'NOT_FOUND', 'Recurso no encontrado');

  // Rutas públicas: sesión.
  if (resource === 'login' && method === 'POST') return login(req, deps, now);
  if (resource === 'logout' && method === 'POST') {
    return { status: 204, setCookie: clearSessionCookie(deps.secureCookies) };
  }

  // Sin sesión responde { user: null } (no es un error: el panel solo decide si mostrar el login).
  if (resource === 'session' && method === 'GET') return ok({ user: currentUser(req, deps, now) });

  const user = requireUser(req, deps, now);

  const store = requireStore(deps);
  const saved = { mode: store.mode };

  switch (`${method} ${resource}${id === undefined ? '' : '/:id'}`) {
    case 'GET overview':
      return ok(await overview(store, now));

    case 'GET articles': {
      const [articles, categories] = await Promise.all([
        listArticles(store),
        readCategories(store),
      ]);
      return ok({ articles, categories } satisfies AdminArticlesResponse);
    }
    case 'POST articles': {
      const article = await saveArticle(
        store,
        parseBody(adminArticleSaveSchema, req.body),
        null,
        user,
      );
      return ok({ article, ...saved }, 201);
    }
    case 'PUT articles/:id': {
      const article = await saveArticle(
        store,
        parseBody(adminArticleSaveSchema, req.body),
        id!,
        user,
      );
      return ok({ article, ...saved });
    }
    case 'DELETE articles/:id':
      await deleteArticle(store, id!, user);
      return ok(saved);

    case 'GET media':
      return ok({ items: await listMedia(store) });
    case 'POST media':
      return ok(
        { ...(await uploadMedia(store, parseBody(mediaUploadSchema, req.body), user)), ...saved },
        201,
      );
    case 'PUT media':
      return ok({
        ...(await replaceMedia(store, parseBody(mediaReplaceSchema, req.body), user)),
        ...saved,
      });
    case 'DELETE media': {
      const src = req.query.get('src');
      if (!src) throw new HttpError(400, 'VALIDATION_ERROR', 'Falta la imagen (src)');
      await deleteMedia(store, src, user);
      return ok(saved);
    }

    case 'GET media/:id': {
      if (id === 'file') return mediaFile(store, req.query.get('src'));
      // /media/texts?src=…: textos que acompañan a la imagen en la web.
      if (id !== 'texts') break;
      const src = req.query.get('src');
      if (!src) throw new HttpError(400, 'VALIDATION_ERROR', 'Falta la imagen (src)');
      return ok({ blocks: await findImageTexts(store, src) });
    }
    case 'PUT media/:id':
      if (id !== 'texts') break;
      await saveImageTexts(store, parseBody(imageTextsSaveSchema, req.body), user);
      return ok(saved);

    case 'GET services':
      return ok(await readServices(store));
    case 'PUT areas': {
      const areas = await saveAreas(store, parseBody(adminAreasSaveSchema, req.body), user);
      return ok({ items: areas.items, ...saved });
    }
    case 'POST landings': {
      const { landing } = parseBody(adminLandingSaveSchema, req.body);
      return ok({ landing: await saveLanding(store, landing, null, user), ...saved }, 201);
    }
    case 'PUT landings/:id': {
      const { landing } = parseBody(adminLandingSaveSchema, req.body);
      return ok({ landing: await saveLanding(store, landing, id!, user), ...saved });
    }
    case 'DELETE landings/:id':
      await deleteLanding(store, id!, user);
      return ok(saved);
    case 'PUT landing-order':
      await reorderLandings(store, parseBody(adminMattersOrderSchema, req.body).order, user);
      return ok(saved);

    case 'GET stats':
      return ok(await computeStats(store, now));

    case 'GET activity':
      return ok({ items: await store.activity(30) });
  }
  throw new HttpError(404, 'NOT_FOUND', 'Recurso no encontrado');
}

/** Procesa una petición del panel. Nunca lanza: los errores salen en formato ApiError. */
export async function handleAdmin(req: AdminRequest, deps: AdminDeps): Promise<AdminResponse> {
  try {
    return await route(req, deps);
  } catch (error) {
    if (error instanceof HttpError) {
      const body: ApiError = {
        error: { code: error.code, message: error.message, details: error.details },
      };
      return { status: error.status, body };
    }
    console.error('Panel: error no controlado', error);
    const body: ApiError = {
      error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
    };
    return { status: 500, body };
  }
}
