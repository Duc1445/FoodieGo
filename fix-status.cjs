const { Client } = require('pg');
const client = new Client('postgres://foodiego:foodiego123@localhost:5432/foodiego');
client.connect()
  .then(() => client.query("UPDATE restaurants SET status = 'APPROVED' WHERE status = 'open' OR status = 'OPEN';"))
  .then(res => { console.log(res.rowCount + ' rows updated'); client.end(); })
  .catch(console.error);
