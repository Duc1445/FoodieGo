import pkg from 'pg';
const { Pool } = pkg;
import { config, createLogger } from '@foodiego/core';

const logger = createLogger('database');

const pool = new Pool({
  connectionString: config.database.url,
  max: config.database.maxConnections,
  idleTimeoutMillis: config.database.idleTimeoutMillis,
  connectionTimeoutMillis: config.database.connectionTimeoutMillis,
});

pool.on('error', (err) => logger.error({ err }, '[DB] error'));

export default pool;
