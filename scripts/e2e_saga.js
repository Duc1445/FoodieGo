const API_GATEWAY = 'http://localhost:3000';

async function fetchAPI(endpoint, method = 'GET', body = null, token = null, customHeaders = {}) {
  const headers = { 
    'Content-Type': 'application/json',
    ...customHeaders
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API_GATEWAY}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    if (!res.ok) throw new Error(text || 'API Error');
    return text;
  }
  if (!res.ok) throw new Error(data.message || 'API Error');
  return data;
}

const customerEmail = `customer_${Date.now()}@test.com`;
const adminEmail = `admin_${Date.now()}@test.com`;

async function runTest() {
  try {
    console.log('=== Starting E2E Saga Verification ===');

    // 1. Customer register
    console.log('1. Customer Register...');
    const loginRes = await fetchAPI('/api/v1/auth/register', 'POST', {
      email: customerEmail,
      password: 'password123',
      full_name: 'E2E Customer',
      role: 'customer'
    });
    const customerToken = loginRes.data.token;
    const customerId = loginRes.data.user.id;
    console.log(`Customer registered and logged in with ID: ${customerId}`);

    // 1b. Admin login
    console.log('1b. Admin Login...');
    const adminLoginRes = await fetchAPI('/api/v1/auth/login', 'POST', {
      email: 'admin@foodiego.com',
      password: 'password123'
    });
    const adminToken = adminLoginRes.data.token;
    console.log('Admin logged in.');

    console.log('2. Create Address...');
    const addressRes = await fetchAPI(`/api/v1/users/${customerId}/addresses`, 'POST', {
      address: '123 Test St, Test City, TS 12345, Test Country',
      phone: '123-456-7890',
      isDefault: true
    }, customerToken);
    const addressId = addressRes.data.id;

    console.log('3. Customer Checkout...');
    let orderId;
    console.log('Checkout failed, trying to add item first...');
    const cartRes = await fetchAPI('/api/v1/cart/items', 'PUT', {
      menu_item_id: '00000000-0000-4000-3333-000000000001',
      quantity: 1
    }, customerToken);
    
    const retryCheckout = await fetchAPI('/api/v1/orders/checkout', 'POST', {
      paymentMethod: 'CASH',
      addressId: addressId,
      cartVersion: cartRes.data.version
    }, customerToken, { 'Idempotency-Key': `checkout-e2e-${Date.now()}` });
    orderId = retryCheckout.data.orderId;
    console.log(`Checkout success after adding item. Order ID: ${orderId}`);

    // 3. Wait for saga (InventoryReserved -> READY_FOR_PAYMENT -> PAID)
    console.log('3. Waiting for Saga (Inventory Reserved & Payment)...');
    let currentStatus = '';
    for (let i = 0; i < 10; i++) {
      const orderRes = await fetchAPI(`/api/v1/orders/${orderId}`, 'GET', null, customerToken);
      currentStatus = orderRes.data.status;
      console.log(`Order status: ${currentStatus}`);
      if (currentStatus === 'PAID') break;
      await new Promise(r => setTimeout(r, 1000));
    }
    
    if (currentStatus !== 'PAID') throw new Error(`Saga didn't complete, stuck at ${currentStatus}`);

    // Transition to READY
    console.log('4. Transition Order to READY...');
    await fetchAPI(`/api/v1/orders/${orderId}/status`, 'PATCH', { status: 'CONFIRMED' }, adminToken);
    await fetchAPI(`/api/v1/orders/${orderId}/status`, 'PATCH', { status: 'PREPARING' }, adminToken);
    await fetchAPI(`/api/v1/orders/${orderId}/status`, 'PATCH', { status: 'READY' }, adminToken);
    console.log('Order is now READY.');

    // 5. Verify Delivery Created
    console.log('5. Verifying Delivery API...');
    const deliveryRes = await fetchAPI('/api/v1/delivery/?status=waiting', 'GET', null, adminToken);
    
    const deliveries = deliveryRes.data;
    const myDelivery = deliveries.find(d => d.order_id === orderId);
    
    if (myDelivery) {
      console.log('✅ SUCCESS: Delivery row created for the order!');
      console.log(myDelivery);
    } else {
      console.log('❌ FAILED: Delivery row not found.');
    }

  } catch (err) {
    console.error('Test Failed:', err.message);
  }
}

runTest();
