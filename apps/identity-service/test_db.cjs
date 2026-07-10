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
  const res = await client.query("SELECT email, password FROM users WHERE email = 'admin@foodiego.com'");
  console.log(res.rows);
  await client.end();
}

run().catch(console.error);
