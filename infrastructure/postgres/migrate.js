#!/usr/bin/env node

/**
 * FoodieGo Database Migration Runner
 * 
 * This script runs all pending migrations in order.
 * Called during CI/CD pipeline and container startup.
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://foodiego:foodiego123@localhost:5432/foodiego',
  application_name: 'FoodieGo-Migrator'
});

// Ensure migrations table exists
async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      version VARCHAR(255) UNIQUE NOT NULL,
      description VARCHAR(500),
      executed_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

// Get list of already-executed migrations
async function getExecutedMigrations() {
  const result = await pool.query('SELECT version FROM schema_migrations ORDER BY version');
  return result.rows.map(row => row.version);
}

// Load init.sql and execute it (idempotent via IF NOT EXISTS)
async function runInitScript() {
  try {
    const initScript = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');
    console.log('Running init.sql...');
    await pool.query(initScript);
    console.log('✅ init.sql completed');
  } catch (error) {
    console.error('❌ init.sql failed:', error.message);
    throw error;
  }
}

// Record migration as executed
async function recordMigration(version, description) {
  await pool.query(
    'INSERT INTO schema_migrations (version, description) VALUES ($1, $2) ON CONFLICT (version) DO NOTHING',
    [version, description]
  );
}

// Main migration runner
async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');
    
    await ensureMigrationsTable();
    const executed = await getExecutedMigrations();
    
    // Run init.sql (creates base schema)
    await runInitScript();
    await recordMigration('000_init_schema', 'Base schema and core tables');
    
    console.log('✅ All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations
runMigrations();
