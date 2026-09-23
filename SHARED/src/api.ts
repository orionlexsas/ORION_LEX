/** Forma estándar de los errores que devuelve la API. */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
