import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://foodiego:foodiego123@localhost:5432/foodiego'
});

async function seed() {
  console.log('Connecting to database...');
  const client = await pool.connect();
  
  try {
    console.log('Adding pg_trgm extension and indexes...');
    await client.query('CREATE EXTENSION IF NOT EXISTS "pg_trgm";');
    await client.query('CREATE INDEX IF NOT EXISTS idx_restaurants_name_trgm ON restaurants USING gin(name gin_trgm_ops);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_menu_items_name_trgm ON menu_items USING gin(name gin_trgm_ops);');

    console.log('Inserting large seed data...');
    
    // Insert 100,000 restaurants
    const BATCH_SIZE = 5000;
    const NUM_RESTAURANTS = 100000;
    let restaurantIds = [];
    
    // Check if we already have restaurants
    const resCount = await client.query('SELECT COUNT(*) FROM restaurants');
    if (parseInt(resCount.rows[0].count) < NUM_RESTAURANTS) {
      console.log(`Inserting ${NUM_RESTAURANTS} restaurants...`);
      for (let i = 0; i < NUM_RESTAURANTS; i += BATCH_SIZE) {
        let values = [];
        let placeholders = [];
        for (let j = 0; j < BATCH_SIZE; j++) {
          const id = uuidv4();
          restaurantIds.push(id);
          const name = `Restaurant ${Math.floor(Math.random() * 1000)} ${['Pho', 'Burger', 'Pizza', 'Sushi', 'Taco', 'Vegan'][Math.floor(Math.random() * 6)]} ${i + j}`;
          values.push(id, name, 'description', 4.5, 'open', true);
          placeholders.push(`($${j * 6 + 1}, $${j * 6 + 2}, $${j * 6 + 3}, $${j * 6 + 4}, $${j * 6 + 5}, $${j * 6 + 6})`);
        }
        await client.query(`
          INSERT INTO restaurants (id, name, description, rating, status, is_active)
          VALUES ${placeholders.join(',')}
        `, values);
        console.log(`Inserted ${i + BATCH_SIZE} restaurants`);
      }
    } else {
      console.log('Restaurants already seeded. Fetching IDs...');
      const ids = await client.query('SELECT id FROM restaurants LIMIT 5000');
      restaurantIds = ids.rows.map(r => r.id);
    }

    console.log('Done seeding!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
