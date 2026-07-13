import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgres://foodiego:foodiego123@localhost:5432/foodiego' 
});

async function seedRestaurant() {
  try {
    console.log('[Seed] Seeding Restaurant...');
    
    // Seed Restaurant
    await pool.query(`
      INSERT INTO restaurants (id, name, description, status, delivery_fee) 
      VALUES ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Pizza Hut', 'Best pizza in town', 'open', 15000) 
      ON CONFLICT DO NOTHING;
    `);

    // Seed Category
    await pool.query(`
      INSERT INTO categories (id, name, description) 
      VALUES ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Pizzas', 'Delicious Pizzas') 
      ON CONFLICT DO NOTHING;
    `);

    // Seed Menu Item
    await pool.query(`
      INSERT INTO menu_items (id, restaurant_id, category_id, name, price, preparation_time) 
      VALUES ('10000000-0000-0000-0000-000000000100', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Pepperoni Pizza', 150000, 20) 
      ON CONFLICT DO NOTHING;
    `);

    console.log('[Seed] Restaurant seeded successfully!');
  } catch (err) {
    console.error('[Seed] Error seeding restaurant:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedRestaurant();
