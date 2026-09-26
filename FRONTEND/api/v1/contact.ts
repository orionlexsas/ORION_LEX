import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
// Rutas con extensión .js (TypeScript las resuelve al .ts): así Node las encuentra en Vercel.
import { handleContact } from '../../server/contact.js';

/*
 * Función de Vercel: POST /api/v1/contact (la misma ruta que usa el frontend).
 * Envía la consulta por el SMTP de Hostinger con la cuenta del despacho.
 * Variables de entorno en Vercel (Settings → Environment Variables), ver FRONTEND/.env.example:
 *   SMTP_USER=abogados@orionlex.co   SMTP_PASS=<contraseña del correo>
 *   Opcionales: SMTP_HOST (smtp.hostinger.com), SMTP_PORT (465), CONTACT_TO (= SMTP_USER)
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { SMTP_HOST = 'smtp.hostinger.com', SMTP_PORT = '465', SMTP_USER, SMTP_PASS } = process.env;
  const to = process.env.CONTACT_TO || SMTP_USER;

  if (!SMTP_USER || !SMTP_PASS || !to) {
    console.error(
      'Formulario de contacto: faltan SMTP_USER o SMTP_PASS en las variables de entorno',
    );
    return res.status(503).json({
      error: { code: 'MAIL_NOT_CONFIGURED', message: 'El envío de correo no está configurado' },
    });
  }

  const port = Number(SMTP_PORT);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    const result = await handleContact(req.method, req.body, {
      sendMail: (message) => transporter.sendMail(message),
      from: SMTP_USER,
      to,
    });
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Formulario de contacto: no se pudo enviar el correo', err);
    return res.status(502).json({
      error: { code: 'MAIL_SEND_FAILED', message: 'No se pudo enviar el mensaje' },
    });
  }
}
