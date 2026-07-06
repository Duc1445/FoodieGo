import pg from 'pg';
import crypto from 'crypto';

const { Pool } = pg;
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgres://foodiego:foodiego123@localhost:5432/foodiego' 
});

async function seedLoadTestUsers() {
  try {
    console.log('[Seed] Seeding 500 Load Test Users...');
    const userIds = [];
    for (let i = 0; i < 500; i++) {
      const id = crypto.randomUUID();
      userIds.push(id);
      await pool.query(`
        INSERT INTO users (id, full_name, email, password, role) 
        VALUES ($1, $2, $3, 'hashed_password', 'customer')
        ON CONFLICT (email) DO NOTHING;
      `, [id, `Load User ${i}`, `loaduser${i}@example.com`]);
    }
    
    // Write userIds to a JSON file for k6 to use
    import('fs').then(fs => {
      fs.writeFileSync('./scripts/load-users.json', JSON.stringify(userIds));
      console.log('[Seed] Wrote 500 user IDs to scripts/load-users.json');
    });

    console.log('[Seed] Load Test Users seeded successfully!');
  } catch (err) {
    console.error('[Seed] Error seeding users:', err);
    process.exit(1);
  } finally {
    // Wait for fs write
    setTimeout(() => pool.end(), 1000);
  }
}

seedLoadTestUsers();
