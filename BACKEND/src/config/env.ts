import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  /** Carpeta de los archivos JSON mientras no hay base de datos. */
  DATA_DIR: z.string().default('data'),
  /** Opcional hasta que se conecte PostgreSQL. */
  DATABASE_URL: z.url().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

/** Valida las variables de entorno al arrancar: si falta algo, falla de inmediato y con claridad. */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    console.error('Variables de entorno inválidas:\n' + z.prettifyError(result.error));
    process.exit(1);
  }
  return result.data;
}
