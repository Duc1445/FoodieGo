import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';

async function resetDb() {
  console.log('[Reset DB] Connecting to PostgreSQL...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://foodiego:foodiego123@localhost:5432/foodiego',
  });

  try {
    await client.connect();
    console.log('[Reset DB] Connected.');

    console.log('[Reset DB] Dropping public schema...');
    await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

    const initSqlPath = path.resolve('infrastructure/postgres/init.sql');
    console.log(`[Reset DB] Executing init.sql from ${initSqlPath}...`);
    
    const sql = fs.readFileSync(initSqlPath, 'utf8');
    await client.query(sql);

    console.log('[Reset DB] Database reset and initialized successfully.');
  } catch (error) {
    console.error('[Reset DB] Failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetDb();
