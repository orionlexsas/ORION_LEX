import type { RequestHandler } from 'express';
import type { ContactRequest } from '@orion-lex/shared';
import type { ContactService } from './contact.service';

/** Traduce HTTP ⇄ servicio. El body ya llega validado por validateBody. */
export function createContactController(service: ContactService) {
  const create: RequestHandler<unknown, unknown, ContactRequest> = async (req, res) => {
    const saved = await service.submit(req.body);
    res.status(201).json(saved);
  };

  return { create };
}
