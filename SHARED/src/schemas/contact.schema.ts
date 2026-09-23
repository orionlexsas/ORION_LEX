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
  'phoneTooLong',
  'messageRequired',
  'messageTooShort',
  'messageTooLong',
] as const;
export type ContactErrorCode = (typeof contactErrorCodes)[number];

const code = (c: ContactErrorCode) => c;

/** Datos que envía el formulario de contacto. Lo valida el frontend y de nuevo el backend. */
export const contactRequestSchema = z.object({
  fullName: z
    .string({ error: code('fullNameRequired') })
    .trim()
    .min(2, code('fullNameRequired'))
    .max(120, code('fullNameTooLong')),
  email: z
    .string({ error: code('emailRequired') })
    .trim()
    .pipe(z.email({ error: code('emailInvalid') })),
  phone: z.string().trim().max(30, code('phoneTooLong')).optional(),
  practiceArea: z.string().trim().max(80).optional(),
  message: z
    .string({ error: code('messageRequired') })
    .trim()
    .min(10, code('messageTooShort'))
    .max(5000, code('messageTooLong')),
});

export type ContactRequest = z.infer<typeof contactRequestSchema>;
