const { Client } = require('pg');
const client = new Client({
  user: 'foodiego', host: 'localhost', database: 'foodiego', password: 'foodiego123', port: 5432,
});
async function run() {
  await client.connect();
  const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'carts'");
  console.log(res.rows);
  
  // also check user_restaurants for the merchant bug
  const mer = await client.query("SELECT * FROM user_restaurants LIMIT 1");
  console.log("user_restaurants:", mer.rows);
  
  await client.end();
}
run().catch(console.error);
