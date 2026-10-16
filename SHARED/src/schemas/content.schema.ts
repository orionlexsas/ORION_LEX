import { z } from 'zod';

/** Íconos disponibles para el contenido editable. El frontend traduce cada nombre a un ícono. */
export const contentIconSchema = z.enum([
  'user',
  'users',
  'clock',
  'phone',
  'mail',
  'map-pin',
  'globe',
  'laptop',
  'scale',
  'briefcase',
  'landmark',
  'gavel',
  'file-text',
  'file-search',
  'messages',
  'route',
  'shield-check',
  'handshake',
  'heart',
  'credit-card',
  'car',
  'file-pen',
  'hospital',
  'message-circle',
]);

/**
 * Enlace o botón. `href: "whatsapp"` abre WhatsApp con el número de `site.contact.whatsapp`
 * (así el número se cambia en un solo lugar) y `message` como texto ya escrito.
 */
const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  message: z.string().optional(),
});

const imageSourceSchema = z.object({
  src: z.string().min(1),
  /** Versión más liviana para pantallas de hasta 767 px. */
  srcMobile: z.string().min(1).optional(),
});

const imageSchema = imageSourceSchema.extend({
  alt: z.string(),
  /** Versión de la imagen para el tema oscuro (opcional; si falta se usa la misma). */
  dark: imageSourceSchema.optional(),
});

/** Ruta interna o slug: solo minúsculas, números y guiones. */
const slugSchema = z.string().regex(/^[a-z0-9-]+$/);

/**
 * Estado del contenido: `final` = aprobado por el despacho; `provisional` = texto de relleno
 * o sin confirmar que debe reemplazarse (ver CONTENIDO_PENDIENTE.md).
 */
const statusSchema = z.enum(['final', 'provisional']).default('final');

const questionSchema = z.object({ question: z.string(), answer: z.string() });

const pageSeoSchema = z.object({ title: z.string(), description: z.string() });

/** Datos globales: marca, SEO por defecto, menú, contacto y pie de página. */
export const siteContentSchema = z.object({
  brand: z.object({
    name: z.string().min(1),
    legalName: z.string().min(1),
    tagline: z.string(),
  }),
  /** Dominio público, sin barra final. Se usa en canonical, Open Graph y el sitemap. */
  siteUrl: z.url().refine((url) => !url.endsWith('/'), 'sin barra final'),
  seo: z.object({ title: z.string(), description: z.string(), image: z.string() }),
  /** Título y descripción de las páginas fijas (las landings y artículos traen los suyos). */
  pages: z.object({
    services: pageSeoSchema,
    about: pageSeoSchema,
    blog: pageSeoSchema,
    contact: pageSeoSchema,
  }),
  nav: z.array(linkSchema),
  cta: linkSchema,
  contact: z.object({
    phone: z.string(),
    email: z.email(),
    /** Texto de cobertura: atención virtual en toda Colombia y el exterior. */
    coverage: z.string(),
    whatsapp: z.object({
      /** Número con indicativo de país, solo dígitos (p. ej. 573132344178). */
      number: z.string().regex(/^\d{8,15}$/),
      /** Mensaje por defecto (botón flotante y enlaces sin mensaje propio). */
      message: z.string(),
    }),
  }),
  /** Perfiles en redes sociales. Instagram se agrega aquí cuando exista. */
  social: z
    .array(
      z.object({
        network: z.enum(['tiktok', 'facebook', 'instagram', 'youtube', 'x']),
        url: z.url(),
      }),
    )
    .default([]),
  footer: z.object({
    cta: z.object({
      eyebrow: z.string(),
      title: z.string(),
      description: z.string(),
      button: linkSchema,
    }),
    tagline: z.string(),
    headings: z.object({ explore: z.string(), services: z.string(), contact: z.string() }),
    rightsText: z.string(),
    legalLinks: z.array(linkSchema),
  }),
  /** Video de introducción: solo en la portada y solo en la primera visita (opcional). */
  intro: z.object({ video: z.string().min(1) }).optional(),
});

/** Portada: hero compacto. */
export const homeContentSchema = z.object({
  hero: z.object({
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
    /** Versión corta de la descripción para celular (opcional; si falta se usa la normal). */
    mobileDescription: z.string().optional(),
    primaryCta: linkSchema,
    secondaryCta: linkSchema,
    /** Frase decorativa en letra manuscrita bajo los botones ("Claridad para avanzar"). */
    script: z.string().optional(),
    /** Franja inferior del hero: frases cortas de confianza con su ícono. */
    points: z.array(z.object({ icon: contentIconSchema, text: z.string() })).max(4),
    image: imageSchema,
    /** Más fotos de fondo: la portada pasa sola de la principal a estas (opcional). */
    slides: z
      .array(
        imageSchema.extend({
          /**
           * `contain`: en computador la foto se ve completa a la derecha (sin recortar ni
           * agrandar) y el resto se llena con ella misma difuminada. Para fotos pequeñas o casi
           * cuadradas. `cover` (por defecto): llena la portada.
           */
          fit: z.enum(['cover', 'contain']).default('cover'),
        }),
      )
      .optional(),
  }),
});

/** Sección "Asuntos que atendemos con frecuencia": encabezado y orden de las tarjetas. */
export const mattersContentSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  description: z.string(),
  /** Frase decorativa manuscrita a la derecha del encabezado (opcional). */
  script: z.string().optional(),
  cardCta: z.string(),
  /** Slugs de las landing pages, en el orden en que se muestran (6 tarjetas). */
  order: z.array(slugSchema).min(1),
});

/**
 * Landing page de un servicio (una por archivo en `landings/`). Pensada para anuncios:
 * cada bloque es opcional salvo el hero, el llamado principal y el cierre.
 */
export const landingContentSchema = z.object({
  slug: slugSchema,
  status: statusSchema,
  /** Nombre del servicio: título de la tarjeta y H1 de la página. */
  title: z.string(),
  seo: z.object({ title: z.string(), description: z.string() }),
  /** Evento de analítica que se envía al pulsar el llamado a WhatsApp (p. ej. datacredito_lead). */
  leadEvent: z
    .string()
    .regex(/^[a-z]+_lead$/)
    .transform((event) => event as `${string}_lead`),
  /** Ícono de la tarjeta; se ve en lugar de la foto mientras no haya `image`. */
  icon: contentIconSchema,
  /** Foto del servicio (tarjeta y encabezado). Opcional: sin ella se usa un panel con el ícono. */
  image: imageSchema.optional(),
  /** Llamado principal: siempre abre WhatsApp con este mensaje. */
  cta: z.object({ label: z.string(), message: z.string() }),
  hero: z.object({
    eyebrow: z.string(),
    /** Pregunta de entrada bajo el título. */
    lead: z.string(),
    paragraphs: z.array(z.string()),
    /** Frase destacada (qué hace Orión Lex por el cliente). */
    emphasis: z.string().optional(),
    /** Aviso destacado junto al botón (p. ej. diagnóstico gratis). */
    highlight: z.string().optional(),
  }),
  cases: z.object({ title: z.string(), items: z.array(z.string()).min(1) }).optional(),
  process: z
    .object({
      title: z.string(),
      steps: z.array(z.object({ title: z.string(), description: z.string() })).min(1),
    })
    .optional(),
  guarantee: z.object({ title: z.string(), text: z.string() }).optional(),
  /** Contador animado. La cifra se cambia aquí; la confirma el despacho. */
  stats: z
    .object({
      prefix: z.string(),
      value: z.number().int().positive(),
      label: z.string(),
    })
    .optional(),
  testimonials: z
    .object({
      title: z.string(),
      /** Vacío hasta recibir reseñas reales: la sección no se muestra. */
      items: z.array(
        z.object({ name: z.string(), text: z.string(), photo: imageSchema.optional() }),
      ),
    })
    .optional(),
  faq: z.object({ title: z.string(), items: z.array(questionSchema).min(1) }).optional(),
  closing: z.object({
    title: z.string(),
    text: z.string(),
    coverage: z.string().optional(),
  }),
});

/** "Cómo trabajamos": pasos del proceso de atención. */
export const approachContentSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  description: z.string(),
  /** Frase manuscrita a la derecha del encabezado; de ella sale la línea que une las etapas. */
  script: z.string().optional(),
  steps: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        /** Foto de la etapa (arriba de la tarjeta). */
        image: imageSchema,
      }),
    )
    .min(1),
  /** Botón bajo las etapas (opcional; el diseño aprobado no lo lleva). */
  cta: linkSchema.optional(),
  /**
   * Video de fondo controlado por el scroll (portada), como secuencia de fotogramas WebP en
   * `<path>/lg/0001.webp…` (computador) y `<path>/sm/…` (celular). Opcional.
   */
  sequence: z
    .object({
      path: z.string().min(1),
      frames: z.object({ lg: z.number().int().min(2), sm: z.number().int().min(2) }),
      alt: z.string(),
    })
    .optional(),
});

/**
 * Áreas del derecho (servicios jurídicos generales). Cada área tiene su página en
 * `/servicios/<slug>` con la explicación (`details`) y el botón a WhatsApp (`message`).
 * La que lleva `featured: true` se muestra como tarjeta grande (Asesoría jurídica).
 */
/**
 * Un servicio concreto dentro de un área (p. ej. Derecho laboral → Despido sin justa causa).
 * Tiene su propia página en /servicios/<área>/<slug>, pensada para compartir en anuncios.
 */
export const practiceServiceSchema = z.object({
  slug: slugSchema,
  status: statusSchema,
  title: z.string().min(1),
  /** Resumen corto: tarjeta y subtítulo de la página. */
  description: z.string().min(1),
  /** Explicación completa en Markdown (## subtítulos, listas, negritas). */
  body: z.string().default(''),
  /** Mensaje de WhatsApp de este servicio. */
  message: z.string().min(1),
  /** Foto propia (opcional: si falta se usa la del área). */
  image: imageSchema.optional(),
  /** Título y descripción para Google y Facebook (opcionales). */
  seo: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
});

export const servicesContentSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  description: z.string(),
  /** Frase manuscrita a la derecha del encabezado (opcional). */
  script: z.string().optional(),
  detailsLabel: z.string(),
  ctaLabel: z.string(),
  /** Enlace de regreso en la página de cada área. */
  backLabel: z.string(),
  /** Enlace de cada tarjeta del mosaico ("Ver más"). */
  readMoreLabel: z.string(),
  /** Cita a la derecha del encabezado (opcional). */
  quote: z.string().optional(),
  /** Imagen decorativa arriba a la derecha, fundida con el fondo (opcional). */
  decor: imageSchema.optional(),
  /** Tarjeta destacada: etiqueta pequeña y franja inferior (opcionales). */
  featuredEyebrow: z.string().optional(),
  featuredNote: z.object({ title: z.string(), text: z.string() }).optional(),
  items: z
    .array(
      z.object({
        slug: slugSchema,
        status: statusSchema,
        featured: z.boolean().default(false),
        icon: contentIconSchema,
        title: z.string(),
        description: z.string(),
        /** Explicación breve que se muestra en la página del área. */
        details: z.string(),
        /** Mensaje de WhatsApp de esta área. */
        message: z.string(),
        image: imageSchema,
        /** Servicios concretos de esta categoría, cada uno en /servicios/<área>/<servicio>. */
        services: z.array(practiceServiceSchema).default([]),
      }),
    )
    .min(1),
});

/** Nosotros: quién atiende al cliente. Misión y visión son opcionales y secundarias. */
export const teamContentSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  description: z.string(),
  /** Frase manuscrita a la derecha del encabezado (opcional). */
  script: z.string().optional(),
  /** Título de las etiquetas de cada perfil ("Áreas de enfoque"). */
  focusLabel: z.string(),
  /** Botón que gira la tarjeta para leer el perfil completo ("Conocer su perfil"). */
  profileLabel: z.string(),
  /** Botón para volver al frente de la tarjeta. */
  backLabel: z.string(),
  /** Franja bajo los perfiles con un llamado a escribir (opcional). */
  closing: z.object({ text: z.string(), cta: linkSchema }).optional(),
  members: z.array(
    z.object({
      status: statusSchema,
      name: z.string(),
      /** Cargo, p. ej. "Abogada | Atención jurídica integral". */
      role: z.string(),
      /** Resumen corto para el frente de la tarjeta (si falta, se usa el primer párrafo). */
      summary: z.string().optional(),
      /** Perfil completo (detrás de la tarjeta); los párrafos van separados por una línea vacía. */
      description: z.string(),
      /** Áreas de enfoque (etiquetas cortas). */
      focus: z.array(z.string()).default([]),
      photo: imageSchema.extend({
        /** Encuadre de la foto dentro del recorte (CSS object-position), p. ej. "50% 20%". */
        position: z.string().default('50% 20%'),
        /** Retrato recortado (fondo transparente): va completo sobre un fondo cálido. */
        cutout: z.boolean().default(false),
      }),
    }),
  ),
  values: z
    .object({
      title: z.string(),
      items: z.array(z.object({ title: z.string(), text: z.string() })),
    })
    .optional(),
});

/** Cobertura: atención virtual en toda Colombia y para personas en el exterior. */
export const coverageContentSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  text: z.string(),
  points: z.array(z.object({ icon: contentIconSchema, title: z.string(), text: z.string() })),
  image: imageSchema,
  /** Foto de fondo de toda la sección (opcional; `srcMobile` para celular). */
  background: imageSchema.optional(),
  cta: linkSchema,
});

/** Testimonios en la portada (casi al final), en carrusel. Sin reseñas, no se muestra. */
export const testimonialsContentSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  description: z.string(),
  /** Frase decorativa manuscrita a la derecha del encabezado (opcional). */
  script: z.string().optional(),
  /** Texto junto a las iniciales de cada tarjeta ("Cliente de Orión Lex"). */
  clientLabel: z.string(),
  /** Nota pequeña al pie (p. ej. sobre los nombres abreviados). */
  note: z.string().optional(),
  items: z.array(
    z.object({
      /** Nombre de quien da la reseña: "María Rodríguez". */
      name: z.string(),
      /** Asunto que se atendió ("Acción de tutela"). */
      service: z.string(),
      text: z.string(),
    }),
  ),
});

/** Textos de la sección Actualidad Jurídica (blog). */
export const blogContentSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  description: z.string(),
  /** Foto del encabezado de /actualidad (se funde con el fondo por la izquierda). */
  heroImage: imageSchema,
  featuredLabel: z.string(),
  /** Enlace del artículo destacado ("Leer artículo"). */
  featuredReadMore: z.string(),
  /** Título sobre la cuadrícula ("Últimos artículos"). */
  latestTitle: z.string(),
  readMore: z.string(),
  allLabel: z.string(),
  empty: z.string(),
  backLabel: z.string(),
  sourcesLabel: z.string(),
  shareLabel: z.string(),
  categories: z.array(z.object({ slug: slugSchema, name: z.string() })).min(1),
  cta: z.object({
    title: z.string(),
    text: z.string(),
    button: linkSchema,
    /** Foto decorativa a la derecha de la franja (opcional). */
    image: imageSchema.optional(),
  }),
  /** Cuántos artículos se muestran en la portada. */
  homeLimit: z.number().int().positive(),
});

/** Un artículo de Actualidad Jurídica (un archivo por artículo en `articles/`). */
export const articleContentSchema = z.object({
  slug: slugSchema,
  status: statusSchema,
  /** false = borrador: no se muestra en la web. */
  published: z.boolean().default(true),
  /** Marca el artículo como "Actualidad jurídica de la semana". */
  featured: z.boolean().default(false),
  title: z.string(),
  category: slugSchema,
  /** Fecha de publicación (AAAA-MM-DD). */
  date: z.iso.date(),
  excerpt: z.string(),
  /** Imagen destacada (opcional: sin ella se usa un panel con la categoría). */
  image: imageSchema.optional(),
  /** Contenido en Markdown (títulos ##, listas, negritas, enlaces). */
  body: z.string().min(1),
  sources: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
  seo: z.object({ description: z.string() }).optional(),
});

/** Páginas legales (privacidad y términos). Su texto debe aprobarlo el despacho. */
const legalPageSchema = z.object({
  status: statusSchema,
  title: z.string(),
  description: z.string(),
  /** Contenido en Markdown. */
  body: z.string(),
});

export const legalContentSchema = z.object({
  privacy: legalPageSchema,
  terms: legalPageSchema,
});

export type ContentImage = z.infer<typeof imageSchema>;
export type ContentIcon = z.infer<typeof contentIconSchema>;
export type ContentLink = z.infer<typeof linkSchema>;
export type SiteContent = z.infer<typeof siteContentSchema>;
export type SocialNetwork = SiteContent['social'][number]['network'];
export type HomeContent = z.infer<typeof homeContentSchema>;
export type MattersContent = z.infer<typeof mattersContentSchema>;
export type LandingContent = z.infer<typeof landingContentSchema>;
export type ApproachContent = z.infer<typeof approachContentSchema>;
export type ServicesContent = z.infer<typeof servicesContentSchema>;
export type ServiceItem = ServicesContent['items'][number];
export type PracticeService = z.infer<typeof practiceServiceSchema>;
export type TeamContent = z.infer<typeof teamContentSchema>;
export type CoverageContent = z.infer<typeof coverageContentSchema>;
export type TestimonialsContent = z.infer<typeof testimonialsContentSchema>;
export type BlogContent = z.infer<typeof blogContentSchema>;
export type ArticleContent = z.infer<typeof articleContentSchema>;
export type LegalContent = z.infer<typeof legalContentSchema>;
export type LegalPage = z.infer<typeof legalPageSchema>;
export type FaqItem = z.infer<typeof questionSchema>;
