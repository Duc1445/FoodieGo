import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || 'postgres://foodiego:foodiego@localhost:5432/foodiego',
});

async function seed() {
  try {
    console.log('Seeding data...');

    // Seed Admin User
    await pool.query(
      "INSERT INTO users (id, email, password, full_name, role) VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@foodiego.com', '$2b$10$rBV2JDeWW3.vKBBnpkVkpOUwG0Q2K6mOGpT0Gk5dRfBN/8kQR1.9a', 'Admin', 'admin') ON CONFLICT DO NOTHING;",
    );

    // Seed Restaurant
    await pool.query(
      "INSERT INTO restaurants (id, name, description, status, delivery_fee) VALUES ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Pizza Hut', 'Best pizza in town', 'open', 15000) ON CONFLICT DO NOTHING RETURNING id;",
    );
    const restaurantId = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

    // Seed Category
    await pool.query(
      "INSERT INTO categories (id, restaurant_id, name, description) VALUES ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', $1, 'Pizzas', 'Delicious Pizzas') ON CONFLICT DO NOTHING RETURNING id;",
      [restaurantId],
    );
    const categoryId = 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';

    // Seed Menu Item
    await pool.query(
      "INSERT INTO menu_items (id, restaurant_id, category_id, name, price, preparation_time) VALUES ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', $1, $2, 'Pepperoni Pizza', 150000, 20) ON CONFLICT DO NOTHING;",
      [restaurantId, categoryId],
    );

    console.log('Seed completed successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
seed();
