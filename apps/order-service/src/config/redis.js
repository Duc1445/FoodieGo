import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

const redis = new Redis(redisUrl, {
  // Hard limit: stop retrying after 3 attempts to prevent hanging processes
  // in environments without Redis (CI without service, local dev, etc.)
  retryStrategy(times) {
    if (times > 3) {
      return null; // stop retrying — let the error propagate
    }
    return Math.min(times * 200, 1000);
  },
  // Disable offline queue: commands issued while disconnected fail fast
  // instead of queuing up indefinitely
  enableOfflineQueue: false,
  // DNS / connection timeout: abort if can't connect within 5s
  connectTimeout: 5000,
  lazyConnect: false,
  maxRetriesPerRequest: 1,
});

redis.on('error', (err) => {
  console.error('[Redis] Error', err);
});

redis.on('connect', () => {
  console.log('[Redis] Connected successfully');
});

export default redis;
