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
    
    // We fetch all menu items from the foodiego DB and seed them as SKUs
    const { rows } = await client.query('SELECT id FROM menu_items');
    console.log(`Found ${rows.length} menu items to seed as inventory SKUs.`);
    
    for (const row of rows) {
      await client.query(`
        INSERT INTO inventory_stock (stock_item_id, total_quantity, reserved_quantity, version)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (stock_item_id) DO UPDATE 
        SET total_quantity = EXCLUDED.total_quantity
      `, [row.id, 100, 0, 1]); // Give 100 stock to each item for testing
    }
    
    await client.query('COMMIT');
    console.log('Seed completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed', err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
