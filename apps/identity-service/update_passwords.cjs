const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const client = new Client({
  user: 'foodiego',
  host: 'localhost',
  database: 'foodiego',
  password: 'foodiego123',
  port: 5432,
});

async function run() {
  const newHash = bcrypt.hashSync('Admin@123', 10);
  console.log('New hash:', newHash);
  
  await client.connect();
  const res = await client.query("UPDATE users SET password = $1 WHERE email = 'admin@foodiego.com' OR email LIKE 'merchant_%'", [newHash]);
  console.log(`Updated ${res.rowCount} users with new password`);
  await client.end();
}

run().catch(console.error);
