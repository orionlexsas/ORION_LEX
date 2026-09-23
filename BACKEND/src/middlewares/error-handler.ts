import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { ApiError } from '@orion-lex/shared';
import { logger } from '../lib/logger';
import { HttpError } from '../utils/http-error';

export const notFound: RequestHandler = () => {
  throw new HttpError(404, 'NOT_FOUND', 'Recurso no encontrado');
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    const body: ApiError = {
      error: { code: err.code, message: err.message, details: err.details },
    };
    res.status(err.status).json(body);
    return;
  }
  logger.error({ err }, 'Error no controlado');
  const body: ApiError = {
    error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
  };
  res.status(500).json(body);
};
