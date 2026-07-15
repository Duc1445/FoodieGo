import Redis from 'ioredis';
import { config, createLogger } from '@foodiego/core';

const logger = createLogger('redis');

let redis;

if (config.redis.url) {
  redis = new Redis(config.redis.url);
  redis.on('error', (err) => logger.error({ err }, '[Redis] error'));
  redis.on('connect', () => logger.info('[Redis] connected'));
} else {
  logger.warn('[Redis] URL not configured, using mock Redis');
  // Mock Redis for development without Redis server
  redis = {
    get: async () => null,
    set: async () => 'OK',
    del: async () => 1,
    expire: async () => 1,
    flushall: async () => 'OK',
    on: () => {},
    disconnect: () => {},
  };
}

export default redis;
