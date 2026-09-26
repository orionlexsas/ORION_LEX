import { z } from 'zod';

/**
 * Códigos de error de validación del formulario de contacto. Son claves, no textos:
 * el frontend los traduce al idioma activo (contact.errors.<código>) y la API los devuelve tal cual.
 */
export const contactErrorCodes = [
  'fullNameRequired',
  'fullNameTooLong',
  'emailRequired',
  'emailInvalid',
  'phoneRequired',
  'phoneInvalid',
  'subjectTooLong',
  'messageRequired',
  'messageTooShort',
  'messageTooLong',
  'privacyRequired',
] as const;
export type ContactErrorCode = (typeof contactErrorCodes)[number];

const code = (c: ContactErrorCode) => c;

/** Datos que envía el formulario de contacto. Lo valida el frontend y de nuevo el servidor. */
export const contactRequestSchema = z.object({
  fullName: z
    .string({ error: code('fullNameRequired') })
    .trim()
    .min(2, code('fullNameRequired'))
    .max(120, code('fullNameTooLong')),
  phone: z
    .string({ error: code('phoneRequired') })
    .trim()
    .min(1, code('phoneRequired'))
    // Dígitos con espacios, guiones, paréntesis o "+" (números de Colombia y del exterior).
    .regex(/^\+?[\d\s()-]{7,20}$/, code('phoneInvalid')),
  email: z
    .string({ error: code('emailRequired') })
    .trim()
    .min(1, code('emailRequired'))
    .pipe(z.email({ error: code('emailInvalid') })),
  /** Asunto: uno de los servicios o texto libre. */
  subject: z.string().trim().max(120, code('subjectTooLong')).optional(),
  message: z
    .string({ error: code('messageRequired') })
    .trim()
    .min(10, code('messageTooShort'))
    .max(5000, code('messageTooLong')),
  /** Aceptación de la política de tratamiento de datos (Ley 1581 de 2012). */
  privacyAccepted: z.literal(true, { error: code('privacyRequired') }),
});

export type ContactRequest = z.infer<typeof contactRequestSchema>;
