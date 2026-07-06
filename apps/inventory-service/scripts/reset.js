import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://foodiego:foodiego123@localhost:5432/foodiego',
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log('Resetting inventory database...');
    
    await client.query('TRUNCATE TABLE inventory_reservation_items CASCADE');
    await client.query('TRUNCATE TABLE inventory_reservations CASCADE');
    await client.query('TRUNCATE TABLE inventory_stock CASCADE');
    
    await client.query('COMMIT');
    console.log('Reset completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Reset failed', err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
