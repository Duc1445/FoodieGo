const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://foodiego:foodiego123@localhost:5432/foodiego' });
async function run() {
  await pool.query("UPDATE orders SET status = 'PENDING' WHERE status = 'PAID'");
  await pool.query("UPDATE orders SET status = 'MERCHANT_ACCEPTED' WHERE status = 'CONFIRMED'");
  await pool.query("UPDATE orders SET status = 'READY_FOR_PICKUP' WHERE status = 'READY'");
  await pool.query("UPDATE orders SET status = 'DRIVER_ACCEPTED' WHERE status = 'ASSIGNED'");
  console.log("Done");
  pool.end();
}
run();
