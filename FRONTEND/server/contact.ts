import { randomUUID } from 'node:crypto';
// Se importa el archivo del esquema (no el paquete @orion-lex/shared) porque la función de
// Vercel no resuelve paquetes del monorepo escritos en TypeScript. Es el mismo esquema, no una copia.
import type { ApiError } from '../../SHARED/src/api.js';
import {
  contactRequestSchema,
  type ContactRequest,
} from '../../SHARED/src/schemas/contact.schema.js';

/*
 * Lógica del formulario de contacto en producción (función de Vercel: api/v1/contact.ts).
 * Valida con el mismo esquema que el frontend y envía la consulta al correo del despacho.
 * No depende de Vercel ni de nodemailer: recibe `sendMail` por parámetro, así se prueba sin
 * enviar correos de verdad (ver contact.test.ts).
 */

export interface MailMessage {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}

export interface ContactHandlerDeps {
  sendMail: (message: MailMessage) => Promise<unknown>;
  /** Buzón que envía (el mismo de la autenticación SMTP) y el que recibe las consultas. */
  from: string;
  to: string;
  now?: () => Date;
}

export interface HandlerResult {
  status: number;
  body: { id: string; createdAt: string } | ApiError;
}

const error = (
  status: number,
  code: string,
  message: string,
  details?: unknown,
): HandlerResult => ({
  status,
  body: { error: { code, message, ...(details !== undefined && { details }) } },
});

/** Escapa texto para insertarlo en el HTML del correo. */
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function buildContactEmail(data: ContactRequest, from: string, to: string): MailMessage {
  const subject = data.subject?.trim() || 'Sin asunto';
  const rows: [string, string][] = [
    ['Nombre', data.fullName],
    ['Teléfono', data.phone],
    ['Correo', data.email],
    ['Asunto', subject],
  ];

  return {
    from: `"Web Orión Lex" <${from}>`,
    to,
    // "Responder" en el correo le escribe directamente a quien llenó el formulario.
    replyTo: `"${data.fullName.replace(/"/g, '')}" <${data.email}>`,
    subject: `Nueva consulta web: ${subject} — ${data.fullName}`,
    text: [
      ...rows.map(([label, value]) => `${label}: ${value}`),
      '',
      'Mensaje:',
      data.message,
      '',
      'Aceptó la política de tratamiento de datos: sí',
    ].join('\n'),
    html: `
      <h2 style="font-family:Georgia,serif">Nueva consulta desde orionlex.co</h2>
      <table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><th align="left" style="color:#555">${label}</th><td>${escapeHtml(value)}</td></tr>`,
          )
          .join('')}
      </table>
      <p style="font-family:Arial,sans-serif"><strong>Mensaje:</strong></p>
      <p style="font-family:Arial,sans-serif;white-space:pre-wrap">${escapeHtml(data.message)}</p>
      <p style="font-family:Arial,sans-serif;color:#777;font-size:12px">
        Aceptó la política de tratamiento de datos.
      </p>`,
  };
}

/** Procesa un envío del formulario y devuelve el código HTTP y la respuesta. */
export async function handleContact(
  method: string | undefined,
  rawBody: unknown,
  deps: ContactHandlerDeps,
): Promise<HandlerResult> {
  if (method !== 'POST') return error(405, 'METHOD_NOT_ALLOWED', 'Usa POST');

  let body = rawBody;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return error(400, 'INVALID_JSON', 'El cuerpo no es JSON válido');
    }
  }

  const accepted = () => ({
    status: 201,
    body: { id: randomUUID(), createdAt: (deps.now?.() ?? new Date()).toISOString() },
  });

  // Campo trampa lleno = robot: se responde como si todo fuera bien, sin enviar nada.
  const honeypot = (body as { website?: unknown } | null)?.website;
  if (typeof honeypot === 'string' && honeypot.trim() !== '') return accepted();

  const parsed = contactRequestSchema.safeParse(body);
  if (!parsed.success) {
    return error(400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.issues);
  }

  await deps.sendMail(buildContactEmail(parsed.data, deps.from, deps.to));
  return accepted();
}
