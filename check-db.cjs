const { Client } = require('pg');
const client = new Client('postgres://foodiego:foodiego123@localhost:5432/foodiego');
client.connect()
  .then(() => client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'restaurants';"))
  .then(res => { console.log(res.rows); client.end(); })
  .catch(console.error);
