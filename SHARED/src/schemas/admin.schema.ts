import { z } from 'zod';
// Con extensión .js: la función de Vercel importa este archivo directamente (ver FRONTEND/server).
import {
  articleContentSchema,
  landingContentSchema,
  servicesContentSchema,
  type LandingContent,
  type ServicesContent,
} from './content.schema.js';

/*
 * Datos del panel de administración (/admin) que viajan entre el navegador y la API
 * /api/v1/admin. Las noticias usan el mismo esquema de los artículos de la web.
 */

/** Inicio de sesión del panel. */
export const adminLoginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1).max(200),
  /** "Recordarme": la sesión dura 30 días en lugar de 12 horas. */
  remember: z.boolean().default(false),
});
export type AdminLogin = z.input<typeof adminLoginSchema>;

export interface AdminUser {
  email: string;
  name: string;
  role: string;
}

/** Carpetas de `public/images/` (solo minúsculas, números y guiones). */
export const mediaFolderSchema = z.string().regex(/^[a-z0-9-]+$/);

/** Formatos de imagen que acepta el panel. El navegador convierte las fotos nuevas a WebP. */
export const imageMimeSchema = z.enum(['image/webp', 'image/jpeg', 'image/png']);
export type ImageMime = z.infer<typeof imageMimeSchema>;

/** Archivo enviado en base64 (sin el prefijo data:). Máximo ~3 MB para caber en Vercel. */
const base64FileSchema = z
  .string()
  .regex(/^[A-Za-z0-9+/]+={0,2}$/, 'base64Invalid')
  .max(4_000_000, 'fileTooLarge');

/** Imagen nueva para la biblioteca. */
export const mediaUploadSchema = z.object({
  folder: mediaFolderSchema,
  /** Nombre sugerido; el servidor lo limpia y evita repetidos. */
  fileName: z.string().min(1).max(120),
  mime: imageMimeSchema,
  data: base64FileSchema,
});
export type MediaUpload = z.infer<typeof mediaUploadSchema>;

/** Reemplazar una imagen existente: misma ruta, archivo nuevo (se actualiza en todo el sitio). */
export const mediaReplaceSchema = z.object({
  /** Ruta pública, p. ej. /images/hero/portada-1672.webp */
  src: z.string().regex(/^\/images\/[a-z0-9-]+\/[a-z0-9._-]+$/),
  mime: imageMimeSchema,
  data: base64FileSchema,
});
export type MediaReplace = z.infer<typeof mediaReplaceSchema>;

/** Dónde aparece una imagen en la web (para no borrar una que esté en uso). */
export interface MediaUsage {
  /** Archivo de contenido, p. ej. es/home.json */
  file: string;
  label: string;
}

export interface MediaItem {
  /** Ruta pública: /images/<carpeta>/<archivo> */
  src: string;
  /** URL para verla en el panel (puede ser distinta de src mientras la web se republica). */
  url: string;
  folder: string;
  name: string;
  size: number;
  usages: MediaUsage[];
}

/** Noticia tal como la edita el panel (el campo `status` lo pone el servidor). */
export const adminArticleSchema = articleContentSchema.omit({ status: true }).extend({
  title: z.string().trim().min(1, 'required').max(160),
  excerpt: z.string().trim().min(1, 'required').max(300),
  body: z.string().trim().min(1, 'required'),
});
export type AdminArticleInput = z.input<typeof adminArticleSchema>;
export type AdminArticle = z.infer<typeof adminArticleSchema>;

/** Guardar una noticia: el artículo y, si se eligió, una imagen destacada nueva. */
export const adminArticleSaveSchema = z.object({
  article: adminArticleSchema,
  /** Imagen subida desde el editor; se guarda en /images/actualidad/ en el mismo cambio. */
  newImage: z
    .object({
      fileName: z.string().min(1).max(120),
      mime: imageMimeSchema,
      data: base64FileSchema,
      /** Descripción de la imagen para lectores de pantalla y Google. */
      alt: z.string().max(200).default(''),
    })
    .optional(),
});
export type AdminArticleSave = z.input<typeof adminArticleSaveSchema>;

export interface AdminCategory {
  slug: string;
  name: string;
}

export interface AdminArticlesResponse {
  articles: AdminArticle[];
  categories: AdminCategory[];
}

/** Un cambio hecho desde el panel (historial de "Últimas acciones"). */
export interface AdminActivity {
  date: string;
  message: string;
  author: string;
}

export interface AdminOverview {
  stats: {
    published: number;
    publishedThisMonth: number;
    drafts: number;
    images: number;
    imagesInUse: number;
    lastPublished: string | null;
  };
  latestArticles: AdminArticle[];
  categories: AdminCategory[];
  activity: AdminActivity[];
  hero: { title: string; image: string };
  /** `github`: los cambios se publican en la web en 1–2 minutos. `local`: al instante. */
  mode: 'local' | 'github';
}

/** Respuesta de cualquier cambio: en producción la web tarda unos minutos en actualizarse. */
export interface AdminSaveResult {
  mode: 'local' | 'github';
}

/** Un texto que acompaña a una imagen en la web (título del banner, cargo, descripción…). */
export interface ImageTextField {
  /** Campo dentro del bloque: "title", o "image.alt" para la descripción de la imagen. */
  key: string;
  label: string;
  value: string;
  multiline: boolean;
  /** Si puede quedar vacío. */
  optional: boolean;
}

/** Bloque de la web donde aparece una imagen, con sus textos editables. */
export interface ImageTextBlock {
  /** Archivo de contenido, p. ej. es/home.json */
  file: string;
  /** Ubicación del bloque dentro del JSON, p. ej. /hero o /items/2 */
  pointer: string;
  label: string;
  fields: ImageTextField[];
}

export const imageTextsSaveSchema = z.object({
  file: z.string().regex(/^es\/([a-z0-9-]+\/)?[a-z0-9-]+\.json$/),
  pointer: z.string().regex(/^(\/[A-Za-z0-9_-]+)*$/),
  values: z.record(z.string().regex(/^[A-Za-z]+(\.alt)?$/), z.string().max(3000)),
});
export type ImageTextsSave = z.infer<typeof imageTextsSaveSchema>;

/** Cifras para la sección Estadísticas del panel. */
export interface AdminStats {
  /** Noticias publicadas por mes (últimos 12 meses, AAAA-MM). */
  byMonth: { month: string; count: number }[];
  /** Noticias por categoría (publicadas y borradores). */
  byCategory: { name: string; published: number; drafts: number }[];
  /** Imágenes por carpeta de la biblioteca. */
  byFolder: { folder: string; count: number; bytes: number; inUse: number }[];
  /** Cambios hechos desde el panel por día (últimos 30 días, AAAA-MM-DD). */
  activityByDay: { day: string; count: number }[];
  totals: { published: number; drafts: number; images: number; bytes: number; actions30d: number };
}

/** Guardar las áreas (categorías) con sus servicios: la lista completa, en orden. */
export const adminAreasSaveSchema = z.object({
  items: servicesContentSchema.shape.items,
});
export type AdminAreasSave = z.input<typeof adminAreasSaveSchema>;

/** Crear o editar un asunto frecuente (landing para anuncios). */
export const adminLandingSaveSchema = z.object({
  landing: landingContentSchema.omit({ status: true }),
});
export type AdminLandingInput = z.input<typeof adminLandingSaveSchema>['landing'];

/** Nuevo orden de las tarjetas de asuntos frecuentes. */
export const adminMattersOrderSchema = z.object({
  order: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1),
});

export interface AdminServicesResponse {
  areas: ServicesContent;
  /** Asuntos frecuentes en el orden de la web. */
  landings: LandingContent[];
}
