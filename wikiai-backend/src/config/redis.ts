import Redis from 'ioredis';
import { logger } from '../utils/logger';
import { env } from './environment';

export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryStrategy: () => null,
  connectTimeout: 5000,
});

let redisReady = false;
let redisStartupCheck = true;

redisClient.on('connect', () => {
  redisReady = true;
  logger.info('✅ Redis connected');
});

redisClient.on('close', () => {
  redisReady = false;
});

redisClient.on('error', (err) => {
  redisReady = false;
  if (!redisStartupCheck) {
    logger.error('Redis error', { err });
  }
});

export const isRedisReady = () => redisReady;

export const connectRedis = async (): Promise<boolean> => {
  try {
    await redisClient.connect();
    redisReady = true;
    return true;
  } catch (err) {
    redisReady = false;
    redisClient.disconnect();
    logger.warn('Redis unavailable; continuing without cache/session support', {
      redisUrl: env.REDIS_URL,
      error: err instanceof Error ? err.message : err,
    });
    return false;
  } finally {
    redisStartupCheck = false;
  }
};
