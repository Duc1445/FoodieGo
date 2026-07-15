const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://foodiego:foodiego123@localhost:5432/foodiego' });
async function run() {
  const res = await pool.query("SELECT id FROM orders WHERE status = 'PENDING' LIMIT 1");
  console.log(res.rows);
  pool.end();
}
run();
