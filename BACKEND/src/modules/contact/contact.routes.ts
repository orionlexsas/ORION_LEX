import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { contactRequestSchema } from '@orion-lex/shared';
import { validateBody } from '../../middlewares/validate-body';
import { createContactController } from './contact.controller';
import type { ContactService } from './contact.service';

export function contactRoutes(service: ContactService): Router {
  const router = Router();
  const controller = createContactController(service);

  // Evita spam: máximo 5 envíos por IP cada 15 minutos.
  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: 'draft-8' });

  router.post('/', limiter, validateBody(contactRequestSchema), controller.create);
  return router;
}
