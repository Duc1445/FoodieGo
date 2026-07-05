import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || 'postgres://foodiego:foodiego@localhost:5432/foodiego',
});
async function seed() {
  try {
    console.log('Seeding data...');
    await pool.query(
      "INSERT INTO users (id, email, password, full_name, role) VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'test@test.com', 'hashedpassword', 'Test User', 'customer') ON CONFLICT DO NOTHING;",
    );
    console.log('Seed completed successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
seed();
