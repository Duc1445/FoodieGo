const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://foodiego:foodiego123@localhost:5432/foodiego' });

async function check() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'order_status_history';
    `);
    console.log('Columns:', res.rows);
  } catch(err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
check();
