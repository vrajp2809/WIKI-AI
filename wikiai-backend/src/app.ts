import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/environment';
import { globalRateLimit } from './middleware/rateLimit.middleware';
import { errorHandler, notFound } from './middleware/errorHandler.middleware';
import { logger } from './utils/logger';
import routes from './routes';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: env.ALLOWED_ORIGINS.split(','),
  credentials: true,
}));

// Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Logging
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// Global rate limit
app.use(globalRateLimit);

// API Routes
app.use(`/api/${env.API_VERSION}`, routes);

// 404 & Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
