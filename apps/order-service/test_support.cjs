const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://foodiego:foodiego123@localhost:5432/foodiego' });
async function run() {
  const res = await pool.query("SELECT id FROM support_tickets LIMIT 1");
  const ticketId = res.rows[0].id;
  
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: '00000000-0000-4000-1111-000000000001', role: 'admin' }, 'supersecretjwtkey', { expiresIn: '1d' });

  const patchRes = await fetch('http://localhost:3003/api/v1/support/' + ticketId, {
    method: 'PATCH',
    headers: { 
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: 'RESOLVED' })
  });
  console.log(patchRes.status, await patchRes.text());
  pool.end();
}
run();
