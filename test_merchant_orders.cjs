const axios = require('axios');
const jwt = require('jsonwebtoken');

async function test() {
  const token = jwt.sign({ id: '00000000-0000-4000-2222-000000000001', role: 'merchant' }, 'supersecretjwtkey_foodiego_2024_secure', { expiresIn: '1d' });
  
  // First, get all orders for merchant
  const res1 = await axios.get('http://localhost:3003/api/v1/orders/merchant', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const orders = res1.data.data;
  if (orders.length > 0) {
    const orderId = orders[0].id;
    console.log("Order ID:", orderId);
    
    // Now try to view the order details
    try {
      const res2 = await axios.get(`http://localhost:3003/api/v1/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Details success:", res2.data);
    } catch(err) {
      console.error("Details Error:", err.response?.data || err.message);
    }
  } else {
    console.log("No orders found");
  }
}
test().catch(console.error);
