const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://foodiego:foodiego123@localhost:5432/foodiego' });

async function run() {
  const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'carts'");
  console.log(res.rows);
  pool.end();
}
run();
