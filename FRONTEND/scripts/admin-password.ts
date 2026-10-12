/*
 * Genera la huella de la contraseña del panel y una clave de sesión, para pegarlas en las
 * variables de entorno (FRONTEND/.env.local en local; Vercel → Settings → Environment Variables).
 *
 *   npm run admin:password -w FRONTEND -- "la-contraseña"
 *
 * La contraseña no se guarda en ningún lado: solo su huella (scrypt).
 */
import { randomBytes } from 'node:crypto';
import { hashPassword } from '../server/admin/auth.js';

const password = process.argv[2];
if (!password || password.length < 10) {
  console.error('Uso: npm run admin:password -w FRONTEND -- "contraseña de 10 caracteres o más"');
  process.exit(1);
}

console.log(`ADMIN_PASSWORD_HASH=${await hashPassword(password)}`);
console.log(`ADMIN_SESSION_SECRET=${randomBytes(32).toString('base64url')}`);
