import path from 'node:path';
import { createApp } from './app';
import { loadEnv } from './config/env';
import { logger } from './lib/logger';
import { createJsonContactRepository } from './modules/contact/contact.json-repository';
import { createContactService } from './modules/contact/contact.service';

// Raíz de composición: aquí se crean las dependencias reales y se conectan entre sí.
const env = loadEnv();

// Por ahora los datos se guardan en archivos JSON dentro de DATA_DIR.
// Para pasar a PostgreSQL: createPrismaContactRepository(createPrismaClient(env.DATABASE_URL)).
const contactRepository = createJsonContactRepository(
  path.resolve(env.DATA_DIR, 'contact-messages.json'),
);

const app = createApp({
  config: env,
  contactService: createContactService(contactRepository),
});

const server = app.listen(env.PORT, () => {
  logger.info(`API escuchando en http://localhost:${env.PORT}/api/v1`);
});

function shutdown(signal: string) {
  logger.info(`${signal} recibido, cerrando...`);
  server.close(() => process.exit(0));
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
