import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgres://foodiego:foodiego123@localhost:5432/foodiego' 
});

async function seedInventory() {
  try {
    console.log('[Seed] Seeding Inventory...');
    
    // Seed Inventory Stock for Limited Edition Pizza
    await pool.query(`
      INSERT INTO inventory_stock (stock_item_id, total_quantity, reserved_quantity, version) 
      VALUES ('10000000-0000-0000-0000-000000000100', 100, 0, 1) 
      ON CONFLICT (stock_item_id) DO UPDATE SET total_quantity = 100, reserved_quantity = 0, version = 1;
    `);

    console.log('[Seed] Inventory seeded successfully!');
  } catch (err) {
    console.error('[Seed] Error seeding inventory:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedInventory();
