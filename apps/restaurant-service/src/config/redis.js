import Redis from 'ioredis';
import { config, createLogger } from '@foodiego/core';

const logger = createLogger('redis');

const redis = new Redis(config.redis.url);

redis.on('error', (err) => logger.error({ err }, '[Redis] error'));
redis.on('connect', () => logger.info('[Redis] connected'));

export default redis;
