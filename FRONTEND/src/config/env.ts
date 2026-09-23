/** Único lugar donde se leen las variables de entorno del frontend. */
export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? '/api/v1',
} as const;
