import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import type { AdminUser } from '../../../SHARED/src/schemas/admin.schema.js';

/*
 * Inicio de sesión del panel, sin base de datos:
 * - La cuenta se configura con variables de entorno (ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD_HASH).
 *   Nunca se guarda la contraseña: solo su huella scrypt (npm run admin:password -w FRONTEND).
 * - La sesión es un token firmado con ADMIN_SESSION_SECRET dentro de una cookie HttpOnly
 *   (JavaScript no puede leerla) y SameSite=Strict (otros sitios no pueden usarla).
 */

export const SESSION_COOKIE = 'orion_admin_session';
/** La cookie solo viaja a la API del panel. */
const COOKIE_PATH = '/api/v1/admin';
const SHORT_SESSION_S = 12 * 60 * 60;
const LONG_SESSION_S = 30 * 24 * 60 * 60;

const scryptAsync = (
  password: string,
  salt: Buffer,
  keylen: number,
  N: number,
  r: number,
  p: number,
) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, keylen, { N, r, p, maxmem: 64 * 1024 * 1024 }, (error, key) =>
      error ? reject(error) : resolve(key),
    ),
  );

/** Huella de una contraseña: scrypt:N:r:p:sal:hash (base64). Sin "$", que .env interpreta como variable. */
export async function hashPassword(password: string): Promise<string> {
  const [N, r, p] = [16384, 8, 1];
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, 32, N, r, p);
  return ['scrypt', N, r, p, salt.toString('base64'), key.toString('base64')].join(':');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, N, r, p, salt, hash] = stored.split(':');
  if (algorithm !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const key = await scryptAsync(
    password,
    Buffer.from(salt, 'base64'),
    expected.length,
    Number(N),
    Number(r),
    Number(p),
  );
  return key.length === expected.length && timingSafeEqual(key, expected);
}

/** Huella de relleno: si el correo no existe se compara igual, para no revelar cuál falló. */
export const DUMMY_HASH =
  'scrypt:16384:8:1:AAAAAAAAAAAAAAAAAAAAAA==:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';

interface SessionPayload extends AdminUser {
  /** Vencimiento (segundos desde 1970). */
  exp: number;
}

const sign = (data: string, secret: string) =>
  createHmac('sha256', secret).update(data).digest('base64url');

export function createSessionToken(user: AdminUser, secret: string, remember: boolean, now: Date) {
  const maxAge = remember ? LONG_SESSION_S : SHORT_SESSION_S;
  const payload: SessionPayload = { ...user, exp: Math.floor(now.getTime() / 1000) + maxAge };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return { token: `${data}.${sign(data, secret)}`, maxAge };
}

/** Usuario de la sesión, o null si el token no es válido o ya venció. */
export function readSessionToken(
  token: string | undefined,
  secret: string,
  now: Date,
): AdminUser | null {
  if (!token) return null;
  const [data, signature] = token.split('.');
  if (!data || !signature) return null;
  const expected = Buffer.from(sign(data, secret));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as SessionPayload;
    if (payload.exp * 1000 < now.getTime()) return null;
    return { email: payload.email, name: payload.name, role: payload.role };
  } catch {
    return null;
  }
}

/**
 * Cookie de sesión. Con "Recordarme" dura 30 días; sin él es de sesión del navegador
 * (se borra al cerrarlo) y el token vence a las 12 horas de todos modos.
 */
export function sessionCookie(token: string, maxAge: number | null, secure: boolean) {
  return [
    `${SESSION_COOKIE}=${token}`,
    `Path=${COOKIE_PATH}`,
    'HttpOnly',
    'SameSite=Strict',
    ...(secure ? ['Secure'] : []),
    ...(maxAge ? [`Max-Age=${maxAge}`] : []),
  ].join('; ');
}

export const clearSessionCookie = (secure: boolean) =>
  [
    `${SESSION_COOKIE}=`,
    `Path=${COOKIE_PATH}`,
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=0',
    ...(secure ? ['Secure'] : []),
  ].join('; ');

export function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  for (const part of header?.split(';') ?? []) {
    const index = part.indexOf('=');
    if (index > 0) cookies[part.slice(0, index).trim()] = part.slice(index + 1).trim();
  }
  return cookies;
}

/**
 * Límite de intentos de inicio de sesión por IP (10 cada 15 minutos). En Vercel vive mientras
 * la función esté activa: frena ataques rápidos; la contraseña larga y scrypt hacen el resto.
 */
export function createLoginLimiter(max = 10, windowMs = 15 * 60 * 1000) {
  const attempts = new Map<string, { count: number; resetAt: number }>();
  return {
    isBlocked(ip: string, now: number) {
      const entry = attempts.get(ip);
      return !!entry && entry.resetAt > now && entry.count >= max;
    },
    fail(ip: string, now: number) {
      const entry = attempts.get(ip);
      if (!entry || entry.resetAt <= now) attempts.set(ip, { count: 1, resetAt: now + windowMs });
      else entry.count += 1;
    },
    reset(ip: string) {
      attempts.delete(ip);
    },
  };
}
export type LoginLimiter = ReturnType<typeof createLoginLimiter>;
