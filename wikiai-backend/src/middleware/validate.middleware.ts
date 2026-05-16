import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { fail } from '../models';

export const validate =
  (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      res.status(400).json(
        fail('VALIDATION_ERROR', 'Invalid request data', result.error.flatten().fieldErrors)
      );
      return;
    }
    req[source] = result.data;
    next();
  };
