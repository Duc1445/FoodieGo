import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://foodiego:foodiego123@localhost:5432/foodiego',
});

async function runDemoReset() {
  console.log('\n=======================================');
  console.log('⚠️  WARNING: RESETTING DEMO DATABASE ⚠️');
  console.log('=======================================\n');
  
  try {
    console.log('Truncating tables...');
    await pool.query(`
      TRUNCATE TABLE 
        users,
        restaurants,
        user_restaurants,
        categories,
        menu_items,
        orders,
        order_items,
        payments,
        delivery,
        promotions,
        promotion_usages,
        support_tickets,
        addresses
      CASCADE;
    `);
    console.log('Database truncated successfully.');
  } catch (err) {
    console.error('Demo reset failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runDemoReset();
