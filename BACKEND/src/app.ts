import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { Env } from './config/env';
import { logger } from './lib/logger';
import { errorHandler, notFound } from './middlewares/error-handler';
import { healthRoutes } from './modules/health/health.routes';
import { contactRoutes } from './modules/contact/contact.routes';
import type { ContactService } from './modules/contact/contact.service';

export interface AppDeps {
  config: Pick<Env, 'CORS_ORIGIN' | 'NODE_ENV'>;
  contactService: ContactService;
}

/** Construye la app sin arrancar el servidor, para poder probarla con dependencias falsas. */
export function createApp({ config, contactService }: AppDeps) {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGIN.split(',') }));
  app.use(express.json({ limit: '100kb' }));
  if (config.NODE_ENV !== 'test') app.use(pinoHttp({ logger }));

  const api = express.Router();
  api.use('/health', healthRoutes());
  api.use('/contact', contactRoutes(contactService));
  app.use('/api/v1', api);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
