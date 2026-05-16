import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { fail } from '../models';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Request error', {
    err: { message: err.message, stack: err.stack },
    url: req.url,
    method: req.method,
    userId: (req as any).user?.userId,
  });

  if (err instanceof ApiError) {
    res.status(err.statusCode).json(fail(err.code, err.message, err.details));
    return;
  }

  // Zod or validation errors that slipped through
  if (err.name === 'ZodError') {
    res.status(400).json(fail('VALIDATION_ERROR', 'Invalid request data', err));
    return;
  }

  // MongoDB duplicate key violation
  if ((err as any).code === 11000) {
    res.status(409).json(fail('DUPLICATE_ERROR', 'Resource already exists'));
    return;
  }

  // Generic fallback
  res.status(500).json(
    fail('INTERNAL_ERROR', 'An unexpected error occurred. Please try again.')
  );
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json(fail('NOT_FOUND', `Route ${req.method} ${req.url} not found`));
};
