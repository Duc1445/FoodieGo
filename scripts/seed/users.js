import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgres://foodiego:foodiego123@localhost:5432/foodiego' 
});

async function seedUsers() {
  try {
    console.log('[Seed] Seeding Users...');
    await pool.query(`
      INSERT INTO users (id, email, password, full_name, role) 
      VALUES 
      ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@foodiego.com', '$2b$10$rBV2JDeWW3.vKBBnpkVkpOUwG0Q2K6mOGpT0Gk5dRfBN/8kQR1.9a', 'Admin', 'admin'),
      ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'customer@foodiego.com', '$2b$10$rBV2JDeWW3.vKBBnpkVkpOUwG0Q2K6mOGpT0Gk5dRfBN/8kQR1.9a', 'Test Customer', 'customer')
      ON CONFLICT (email) DO NOTHING;
    `);
    console.log('[Seed] Users seeded successfully!');
  } catch (err) {
    console.error('[Seed] Error seeding users:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedUsers();
