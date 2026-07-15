const axios = require('axios');
const jwt = require('jsonwebtoken');

async function test() {
  try {
    const res = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'merchant@foodiego.com',
      password: 'password123'
    });
    const token = res.data.data.token;
    console.log('Token Payload:', jwt.decode(token));
  } catch(err) {
    console.error('Login Error:', err.response?.data || err.message);
  }
}
test();
