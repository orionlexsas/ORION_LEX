import type { VercelRequest, VercelResponse } from '@vercel/node';
// Rutas con extensión .js (TypeScript las resuelve al .ts): así Node las encuentra en Vercel.
import { createAdminDeps } from '../../server/admin/config.js';
import { handleAdmin } from '../../server/admin/handler.js';
import { clientIp, sendAdminResponse } from '../../server/admin/node.js';

/*
 * Función de Vercel para la API del panel: /api/v1/admin/* llega aquí por la regla de
 * vercel.json, que pasa la ruta en ?path=. Variables de entorno: ver FRONTEND/.env.example.
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const path = url.searchParams.get('path') ?? url.pathname.replace(/^\/api\/v1\/admin/, '');
  url.searchParams.delete('path');

  const result = await handleAdmin(
    {
      method: req.method ?? 'GET',
      path: `/${path.replace(/^\/+/, '')}`,
      query: url.searchParams,
      body: req.body as unknown,
      cookieHeader: req.headers.cookie,
      ip: clientIp(req),
    },
    createAdminDeps(process.env, { secureCookies: true }),
  );
  sendAdminResponse(res, result);
}
