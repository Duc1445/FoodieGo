const pg = require('pg');
const pool = new pg.Pool({ connectionString: 'postgres://foodiego:foodiego123@localhost:5432/foodiego' });

async function resetPass() {
  const hash = '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS'; // '123456' or 'password'
  await pool.query(`UPDATE users SET password=$1 WHERE email='merchant_miquangbamua@foodiego.com'`, [hash]);
  console.log('Merchant password reset');
  
  const res = await pool.query(`SELECT password FROM users WHERE email='customer@foodiego.com'`);
  if (res.rows.length > 0) {
    console.log('Customer password is the same hash');
  } else {
    // Insert customer if not exists
    await pool.query(`INSERT INTO users (id, email, password, full_name, role) VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'customer@foodiego.com', $1, 'Test Customer', 'customer') ON CONFLICT DO NOTHING`, [hash]);
    console.log('Customer created');
  }
}

resetPass().finally(() => pool.end());
