const axios = require('axios');
const { Client } = require('pg');

async function run() {
  const client = new Client({ user: 'foodiego', host: 'localhost', database: 'foodiego', password: 'foodiego123', port: 5432 });
  await client.connect();
  // Get a user and token (mock)
  // Let's just create a token for a customer
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: '00000000-0000-4000-1111-000000000001', role: 'customer' }, 'supersecretjwtkey_foodiego_2024_secure', { expiresIn: '1d' });

  // Get a food item
  const { rows } = await client.query('SELECT id FROM menu_items LIMIT 1');
  const foodId = rows[0].id;
  
  try {
    const res = await axios.put('http://localhost:3003/api/v1/cart/items', {
      menu_item_id: foodId,
      quantity: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
  await client.end();
}
run().catch(console.error);
