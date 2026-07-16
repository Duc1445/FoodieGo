const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://foodiego:foodiego123@localhost:5432/foodiego' });

async function run() {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: '00000000-0000-4000-1111-000000000001', role: 'customer' }, 'supersecretjwtkey', { expiresIn: '1d' });

  // Get a valid menu item
  const res = await pool.query("SELECT id FROM menu_items WHERE status = 'AVAILABLE' LIMIT 1");
  const menuItemId = res.rows[0].id;

  const patchRes = await fetch('http://localhost:3003/api/v1/cart/items', {
    method: 'PUT',
    headers: { 
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ menu_item_id: menuItemId, quantity: 1 })
  });
  console.log(patchRes.status, await patchRes.text());
  pool.end();
}
run();
