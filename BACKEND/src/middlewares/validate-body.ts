import type { RequestHandler } from 'express';
import { z, type ZodType } from 'zod';
import { HttpError } from '../utils/http-error';

/** Valida y normaliza req.body con un esquema de Zod antes de llegar al controlador. */
export function validateBody(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Datos inválidos', z.flattenError(result.error));
    }
    req.body = result.data;
    next();
  };
}
