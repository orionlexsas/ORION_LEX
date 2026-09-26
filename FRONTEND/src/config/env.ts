/** Lee una variable VITE_* y devuelve undefined si está vacía. */
const optional = (value: string | undefined) => (value?.trim() ? value.trim() : undefined);

/**
 * Único lugar donde se leen las variables de entorno del frontend (ver .env.example).
 * Los identificadores de analítica son opcionales: sin ellos no se carga ningún script.
 */
export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? '/api/v1',
  /** Google Tag Manager (GTM-XXXXXXX). Si existe, GA4 y Meta Pixel pueden configurarse desde GTM. */
  gtmId: optional(import.meta.env.VITE_GTM_ID),
  /** Google Analytics 4 (G-XXXXXXXXXX), si no se usa GTM. */
  gaId: optional(import.meta.env.VITE_GA_ID),
  /** Meta Pixel (solo números), para medir los anuncios de Facebook e Instagram. */
  metaPixelId: optional(import.meta.env.VITE_META_PIXEL_ID),
} as const;
