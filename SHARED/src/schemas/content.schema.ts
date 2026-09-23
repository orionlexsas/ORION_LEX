import { z } from 'zod';

/** Íconos disponibles para el contenido editable. El frontend traduce cada nombre a un ícono. */
export const contentIconSchema = z.enum([
  'user',
  'clock',
  'chart',
  'phone',
  'mail',
  'map-pin',
  'scale',
  'briefcase',
  'users',
  'landmark',
  'gavel',
  'file-text',
  'messages',
  'file-search',
]);

/** Fragmento de texto; `highlight` lo pinta en dorado. */
const highlightTextSchema = z.object({ text: z.string(), highlight: z.boolean().default(false) });

/**
 * Enlace o botón. `href: "whatsapp"` abre WhatsApp con el número y mensaje de
 * `site.contact.whatsapp` (así el número se cambia en un solo lugar).
 */
const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

const imageSourceSchema = z.object({
  src: z.string().min(1),
  /** Versión más liviana para pantallas de hasta 767 px. */
  srcMobile: z.string().min(1).optional(),
});

const imageSchema = imageSourceSchema.extend({
  alt: z.string(),
  /** Versión de la imagen para el tema claro (opcional; si falta se usa la misma). */
  light: imageSourceSchema.optional(),
});

/** Pie de página: franja de llamada a la acción, columnas de enlaces y datos legales. */
const footerSchema = z.object({
  cta: z.object({
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
    button: linkSchema,
    scriptLines: z.array(z.string()),
    image: imageSchema,
  }),
  tagline: z.string(),
  headings: z.object({ explore: z.string(), services: z.string(), contact: z.string() }),
  /** Cuántos servicios (en el orden de services.json) se listan en el pie. */
  servicesLimit: z.number().int().positive(),
  writeUsLabel: z.string(),
  rightsText: z.string(),
  legalLinks: z.array(linkSchema),
  decorations: z.object({ left: imageSchema, right: imageSchema }),
});

/** Datos globales del sitio: marca, menú, datos de contacto y pie de página. */
export const siteContentSchema = z.object({
  brand: z.object({
    name: z.string().min(1),
    tagline: z.string(),
  }),
  nav: z.array(linkSchema),
  cta: linkSchema,
  contact: z.object({
    phone: z.string(),
    email: z.email(),
    city: z.string(),
    modality: z.string(),
    whatsapp: z.object({
      /** Número con indicativo de país, solo dígitos (p. ej. 573132344178). */
      number: z.string().regex(/^\d{8,15}$/),
      /** Mensaje que aparece ya escrito al abrir el chat. */
      message: z.string(),
    }),
  }),
  /** Perfiles en redes sociales (se muestran como íconos en el pie). */
  social: z
    .array(
      z.object({
        network: z.enum(['tiktok', 'facebook', 'instagram', 'youtube', 'x']),
        url: z.url(),
      }),
    )
    .default([]),
  footer: footerSchema,
  /** Video de introducción que se muestra una vez por visita (opcional). */
  intro: z.object({ video: z.string().min(1) }).optional(),
});

/** Contenido de la página de inicio. */
export const homeContentSchema = z.object({
  hero: z.object({
    eyebrow: z.string(),
    /** Cada línea del título; `highlight` la pinta en dorado. */
    titleLines: z.array(highlightTextSchema),
    description: z.string(),
    primaryCta: linkSchema,
    secondaryCta: linkSchema,
    image: imageSchema,
    highlights: z.array(
      z.object({ icon: contentIconSchema, title: z.string(), description: z.string() }),
    ),
    contactItems: z.array(
      z.object({
        icon: contentIconSchema,
        label: z.string(),
        value: z.string(),
        detail: z.string().optional(),
        href: z.string().optional(),
      }),
    ),
    signature: z.object({
      scriptLines: z.array(z.string()),
      brand: z.string(),
      tagline: z.string(),
    }),
    quote: z.string(),
    scrollHint: z.string(),
  }),
});

/** Sección de servicios: encabezado, servicio destacado y tarjetas. */
export const servicesContentSchema = z.object({
  eyebrow: z.string(),
  title: z.array(highlightTextSchema),
  description: z.string(),
  quote: z.string(),
  image: imageSchema,
  brand: z.object({ name: z.string(), tagline: z.string() }),
  /** El primero se muestra como tarjeta destacada. */
  items: z
    .array(
      z.object({
        slug: z.string().regex(/^[a-z0-9-]+$/),
        icon: contentIconSchema,
        title: z.string(),
        description: z.string(),
        href: z.string(),
        image: imageSchema.optional(),
      }),
    )
    .min(1),
  featured: z.object({
    eyebrow: z.string(),
    footerLabel: z.string(),
    footerText: z.string(),
  }),
  linkLabel: z.string(),
});

/** Sección "Nuestro enfoque": pasos del proceso de atención. */
export const approachContentSchema = z.object({
  eyebrow: z.string(),
  title: z.array(highlightTextSchema),
  description: z.string(),
  scriptLines: z.array(z.string()),
  steps: z
    .array(
      z.object({
        icon: contentIconSchema,
        title: z.string(),
        description: z.string(),
        image: imageSchema,
      }),
    )
    .min(1),
  cta: linkSchema,
  decoration: imageSchema,
});

/** Sección "Nuestros clientes": carrusel de tarjetas con foto. */
export const clientsContentSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  /** Segundos entre cada cambio automático de tarjeta. */
  autoplaySeconds: z.number().positive().default(5),
  items: z.array(z.object({ tag: z.string(), caption: z.string(), image: imageSchema })).min(1),
});

/** Sección "Preguntas frecuentes". */
export const faqContentSchema = z.object({
  eyebrow: z.string(),
  title: z.array(highlightTextSchema),
  description: z.string(),
  items: z.array(z.object({ question: z.string(), answer: z.string() })).min(1),
  cta: linkSchema,
  /** Texto pequeño bajo el botón (p. ej. ciudades). */
  footnote: z.string().optional(),
  decorations: z.object({ right: imageSchema, left: imageSchema }),
});

/** Porcentaje (0–100) dentro de la imagen del mapa. */
const percentSchema = z.number().min(0).max(100);

/** Sección "Dónde te atendemos": mapa con las ciudades. */
export const locationsContentSchema = z.object({
  eyebrow: z.string(),
  /** Cada línea del título, con sus partes (`highlight` = dorado). */
  titleLines: z.array(z.array(highlightTextSchema)),
  description: z.string(),
  features: z.array(z.object({ icon: contentIconSchema, text: z.string() })),
  cta: linkSchema,
  map: imageSchema,
  cities: z
    .array(
      z.object({
        name: z.string(),
        detail: z.string(),
        /** Ubicación del marcador sobre el mapa. */
        marker: z.object({ x: percentSchema, y: percentSchema }),
        /** Punto donde termina la línea y se apoya la etiqueta; `side` = hacia dónde va el texto. */
        label: z.object({ x: percentSchema, y: percentSchema, side: z.enum(['left', 'right']) }),
      }),
    )
    .min(1),
});

export type ContentImage = z.infer<typeof imageSchema>;
export type ContentIcon = z.infer<typeof contentIconSchema>;
export type SiteContent = z.infer<typeof siteContentSchema>;
export type SocialNetwork = SiteContent['social'][number]['network'];
export type HomeContent = z.infer<typeof homeContentSchema>;
export type ApproachContent = z.infer<typeof approachContentSchema>;
export type ClientsContent = z.infer<typeof clientsContentSchema>;
export type FaqContent = z.infer<typeof faqContentSchema>;
export type LocationsContent = z.infer<typeof locationsContentSchema>;
export type ServicesContent = z.infer<typeof servicesContentSchema>;
export type ServiceItem = ServicesContent['items'][number];
