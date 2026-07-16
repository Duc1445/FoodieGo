const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://foodiego:foodiego123@localhost:5432/foodiego' });
async function run() {
  await pool.query("UPDATE orders SET status = 'PENDING' WHERE status = 'CREATED'");
  console.log("Done");
  pool.end();
}
run();
