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
]);

/** Fragmento de texto; `highlight` lo pinta en dorado. */
const highlightTextSchema = z.object({ text: z.string(), highlight: z.boolean().default(false) });

const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

const imageSchema = z.object({
  src: z.string().min(1),
  srcMobile: z.string().min(1).optional(),
  alt: z.string(),
});

/** Datos globales del sitio: marca, barra superior, menú y datos de contacto. */
export const siteContentSchema = z.object({
  brand: z.object({
    name: z.string().min(1),
    tagline: z.string(),
  }),
  topBar: z.object({
    location: z.string(),
    slogan: z.string(),
    values: z.array(z.string()),
  }),
  nav: z.array(linkSchema),
  cta: linkSchema,
  contact: z.object({
    phone: z.string(),
    email: z.email(),
    city: z.string(),
    modality: z.string(),
  }),
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

export type ContentIcon = z.infer<typeof contentIconSchema>;
export type SiteContent = z.infer<typeof siteContentSchema>;
export type HomeContent = z.infer<typeof homeContentSchema>;
export type ServicesContent = z.infer<typeof servicesContentSchema>;
export type ServiceItem = ServicesContent['items'][number];
