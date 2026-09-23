import type { ApiError } from '@orion-lex/shared';
import { env } from '@/config/env';

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/** Cliente HTTP único: todas las llamadas a la API pasan por aquí. */
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body: unknown = res.status === 204 ? undefined : await res.json().catch(() => undefined);

  if (!res.ok) {
    const error = (body as ApiError | undefined)?.error;
    throw new ApiRequestError(
      res.status,
      error?.code ?? 'HTTP_ERROR',
      error?.message ?? 'No se pudo conectar con el servidor',
      error?.details,
    );
  }
  return body as T;
}
