import type { IncomingMessage, ServerResponse } from 'node:http';
import { createAdminDeps } from './config.js';
import { handleAdmin, type AdminResponse } from './handler.js';

/** Escribe la respuesta del panel en una respuesta HTTP de Node (Vercel o Vite). */
export function sendAdminResponse(res: ServerResponse, result: AdminResponse) {
  res.statusCode = result.status;
  // Datos privados: que no se guarden en cachés compartidas ni aparezcan en buscadores.
  res.setHeader('Cache-Control', result.cacheControl ?? 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  if (result.setCookie) res.setHeader('Set-Cookie', result.setCookie);
  if (result.body === undefined) {
    res.end();
    return;
  }
  if (Buffer.isBuffer(result.body)) {
    res.setHeader('Content-Type', result.contentType ?? 'application/octet-stream');
    res.end(result.body);
    return;
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(result.body));
}

/** IP del visitante (detrás de Vercel llega en x-forwarded-for). */
export function clientIp(req: IncomingMessage) {
  const forwarded = req.headers['x-forwarded-for'];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim();
  return first || req.socket.remoteAddress || 'desconocida';
}

async function readBody(req: IncomingMessage, limit = 6 * 1024 * 1024): Promise<string> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req as AsyncIterable<Buffer>) {
    size += chunk.length;
    if (size > limit) throw new Error('Cuerpo demasiado grande');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

/**
 * Desarrollo local: el servidor de Vite pasa aquí /api/v1/admin/* (ver vite.config.ts).
 * Guarda en los archivos del proyecto (`rootDir` = carpeta ORION_LEX).
 */
export async function handleDevRequest(
  req: IncomingMessage,
  res: ServerResponse,
  env: Record<string, string | undefined>,
  rootDir: string,
) {
  // Vite ya quitó el prefijo /api/v1/admin de req.url.
  const url = new URL(req.url ?? '/', 'http://localhost');
  const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await readBody(req);
  const result = await handleAdmin(
    {
      method: req.method ?? 'GET',
      path: url.pathname,
      query: url.searchParams,
      body: body || undefined,
      cookieHeader: req.headers.cookie,
      ip: clientIp(req),
    },
    // En local siempre se guarda en el disco, aunque haya un GITHUB_TOKEN en el entorno.
    createAdminDeps({ ...env, GITHUB_TOKEN: undefined }, { rootDir, secureCookies: false }),
  );
  sendAdminResponse(res, result);
}
