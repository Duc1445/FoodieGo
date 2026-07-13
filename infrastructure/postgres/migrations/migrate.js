import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/foodiego',
});

async function runMigrations() {
  console.log('Starting migrations...');
  const client = await pool.connect();
  
  try {
    // Basic migration tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const files = await fs.readdir(__dirname);
    const sqlFiles = files
      .filter((f) => f.endsWith('.sql'))
      .sort(); // Sort alphanumerically to run in order

    for (const file of sqlFiles) {
      const { rows } = await client.query('SELECT id FROM migrations WHERE filename = $1', [file]);
      if (rows.length === 0) {
        console.log(`Executing migration: ${file}`);
        const sql = await fs.readFile(path.join(__dirname, file), 'utf8');
        
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`✓ Completed: ${file}`);
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`✗ Failed: ${file}`, error);
          throw error;
        }
      } else {
        console.log(`Skipping already executed migration: ${file}`);
      }
    }
    
    console.log('All migrations completed successfully.');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
