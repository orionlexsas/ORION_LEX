import { defineConfig } from 'prisma/config';

try {
  process.loadEnvFile();
} catch {
  // Sin .env: se usan las variables del entorno (p. ej. en producción).
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL },
});
