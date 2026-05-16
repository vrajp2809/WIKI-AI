import rateLimit from 'express-rate-limit';
import { env } from '../config/environment';
import { fail } from '../models';

export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.GLOBAL_RATE_LIMIT_PER_15MIN,
  standardHeaders: true,
  legacyHeaders: false,
  message: fail('RATE_LIMIT', 'Too many requests. Please try again in 15 minutes.'),
});

export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: env.AI_RATE_LIMIT_PER_MINUTE,
  keyGenerator: (req) => (req as any).user?.userId ?? req.ip ?? 'unknown',
  message: fail('AI_RATE_LIMIT', 'Too many AI requests. Please wait a moment.'),
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: fail('AUTH_RATE_LIMIT', 'Too many auth attempts. Please try again in 15 minutes.'),
});
