import bcrypt from 'bcryptjs';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgres://foodiego:foodiego123@localhost:5432/foodiego',
});

async function fix() {
  const hash = await bcrypt.hash('password', 10);
  console.log('Hash for "password":', hash);
  await pool.query(
    `UPDATE users SET password=$1 WHERE email='merchant_miquangbamua@foodiego.com'`,
    [hash],
  );
  await pool.query(`UPDATE users SET password=$1 WHERE email='customer@foodiego.com'`, [hash]);
  console.log('Passwords updated to "password"!');
  pool.end();
}
fix();
