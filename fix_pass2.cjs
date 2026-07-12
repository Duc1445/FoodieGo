const { Client } = require('pg');
const client = new Client('postgresql://foodiego:foodiego123@localhost:5432/foodiego');
client.connect()
  .then(() => client.query('UPDATE users SET password = $1 WHERE email = $2', ['$2a$10$GW/f7k0G5SMpwGrxiA.XwufmWIIqppMA77XcwXo1xFVG.4OADdDKq', 'merchant@foodiego.com']))
  .then(() => { console.log('Fixed'); client.end(); });
