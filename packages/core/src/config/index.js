export const config = {
  env: process.env.NODE_ENV || 'development',
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
  },
  database: {
    url: process.env.DATABASE_URL,
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS, 10) || 10,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONN_TIMEOUT, 10) || 2000,
  },
  redis: {
    url: process.env.REDIS_URL,
    ttl: parseInt(process.env.REDIS_TTL, 10) || 3600,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  services: {
    identity: process.env.IDENTITY_SERVICE_URL,
    restaurant: process.env.RESTAURANT_SERVICE_URL,
    order: process.env.ORDER_SERVICE_URL,
  },
};
