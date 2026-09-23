import { z } from 'zod';

/** Datos que envía el formulario de contacto. Lo valida el frontend y de nuevo el backend. */
export const contactRequestSchema = z.object({
  fullName: z
    .string({ error: 'Escribe tu nombre completo' })
    .trim()
    .min(2, 'Escribe tu nombre completo')
    .max(120, 'Máximo 120 caracteres'),
  email: z
    .string({ error: 'Escribe tu correo' })
    .trim()
    .pipe(z.email({ error: 'Correo no válido' })),
  phone: z.string().trim().max(30, 'Máximo 30 caracteres').optional(),
  practiceArea: z.string().trim().max(80).optional(),
  message: z
    .string({ error: 'Cuéntanos en qué podemos ayudarte' })
    .trim()
    .min(10, 'Cuéntanos un poco más')
    .max(5000, 'Máximo 5000 caracteres'),
});

export type ContactRequest = z.infer<typeof contactRequestSchema>;
