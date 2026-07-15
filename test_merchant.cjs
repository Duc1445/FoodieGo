const pg = require('pg');
const pool = new pg.Pool({
  user: 'postgres',
  password: 'password', // check actual password
  host: 'localhost',
  port: 5432,
  database: 'foodiego'
});

async function main() {
  const { rows: users } = await pool.query("SELECT id, role, email FROM users WHERE role = 'merchant'");
  console.log("Merchants:", users.length);
  if (users.length > 0) {
    const merchantId = users[0].id;
    const { rows: user_rest } = await pool.query("SELECT restaurant_id FROM user_restaurants WHERE user_id = $1", [merchantId]);
    console.log("Merchant Restaurant IDs:", user_rest.map(r => r.restaurant_id));
    
    const { rows: orders } = await pool.query("SELECT id, restaurant_id FROM orders LIMIT 1");
    if (orders.length > 0) {
      console.log("Order Restaurant ID:", orders[0].restaurant_id);
    }
  }
  pool.end();
}
main().catch(console.error);
