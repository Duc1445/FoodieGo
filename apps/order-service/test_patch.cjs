const jwt = require('jsonwebtoken');

async function test() {
  try {
    const token = jwt.sign({ id: '00000000-0000-4000-2222-000000000001', role: 'merchant' }, 'supersecretjwtkey', { expiresIn: '1d' });

    const res = await fetch('http://localhost:3003/api/v1/orders/merchant', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const orders = data.data;
    if (orders && orders.length > 0) {
      const orderId = orders[0].id;
      console.log('Testing update on order:', orderId);
      
      const patchRes = await fetch(`http://localhost:3003/api/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'MERCHANT_ACCEPTED' })
      });
      const patchData = await patchRes.json();
      console.log('Patch response:', patchRes.status, patchData);

      const getRes = await fetch(`http://localhost:3003/api/v1/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const getData = await getRes.json();
      console.log('Get response:', getRes.status, getData);
    } else {
      console.log('No orders:', data);
    }
  } catch(err) {
    console.error('Error:', err.message);
  }
}
test();
