const { Client } = require('pg');

const client = new Client({
  user: 'foodiego',
  host: 'localhost',
  database: 'foodiego',
  password: 'foodiego123',
  port: 5432,
});

async function run() {
  await client.connect();
  const res = await client.query("SELECT id, name FROM restaurants");
  console.log('Restaurants:');
  res.rows.forEach(r => console.log(r.name));
  
  const merchantRes = await client.query("SELECT email FROM users WHERE role = 'merchant'");
  console.log('\nMerchants:');
  merchantRes.rows.forEach(r => console.log(r.email));
  
  await client.end();
}

run().catch(console.error);
