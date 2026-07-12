const BASE_URL = 'http://localhost:3000/api/v1';

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchAPI(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`API Error ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

async function runE2E() {
  console.log('--- E2E UI NETWORK FLOW (Terminal Mock) ---');
  let customerToken = '';
  let merchantToken = '';
  let restaurantId = '';
  let menuItem = null;
  let orderId = '';

  try {
    // 1. Đăng nhập Customer
    console.log('\n[Step 1] Customer Login');
    console.log('Request: POST /auth/login { email: "customer@foodiego.com", password: "password" }');
    const customerLogin = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'customer@foodiego.com', password: 'password' })
    });
    customerToken = customerLogin.data.token;
    console.log('Response:', customerLogin.data.user.email, 'logged in. Token:', customerToken.substring(0, 10) + '...');
    console.log('-> PASS');

    // 2. Chọn nhà hàng
    console.log('\n[Step 2] Search Restaurant');
    console.log('Request: GET /restaurants?search=Pho');
    const searchRes = await fetchAPI('/restaurants?search=Pho');
    const restaurant = searchRes.data[0];
    restaurantId = restaurant.id;
    console.log('Response: Found restaurant:', restaurant.name, `(${restaurant.id})`);
    console.log('-> PASS');

    // 3. Chọn món
    console.log('\n[Step 3] Get Restaurant Menu');
    console.log(`Request: GET /restaurants/${restaurantId}/menu`);
    const menuRes = await fetchAPI(`/restaurants/${restaurantId}/menu`);
    menuItem = menuRes.data[0].items[0]; // First category, first item
    console.log('Response: Found menu item:', menuItem.name, `Price: ${menuItem.price}`);
    console.log('-> PASS');

    // 4. Thêm vào giỏ hàng
    console.log('\n[Step 4] Add to Cart');
    console.log(`Request: PUT /cart/items { menu_item_id, quantity: 1 }`);
    const cartRes = await fetchAPI(`/cart/items`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        menu_item_id: menuItem.id,
        quantity: 1
      })
    });
    const cartVersion = cartRes.data.version;
    console.log('Response: Item added to cart. Version:', cartVersion);
    console.log('-> PASS');

    // 5. Vào Checkout & 6. Nhập địa chỉ & 7. Đặt hàng
    console.log('\n[Step 5-7] Checkout and Place Order');
    const checkoutData = {
      restaurantId,
      items: [{ menuItemId: menuItem.id, quantity: 1, price: menuItem.price, name: menuItem.name }],
      deliveryAddress: '123 Test St, Da Nang',
      paymentMethod: 'COD',
      cartVersion
    };
    console.log(`Request: POST /orders/checkout`, JSON.stringify(checkoutData));
    const checkoutRes = await fetchAPI(`/orders/checkout`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${customerToken}`,
        'Idempotency-Key': Date.now().toString()
      },
      body: JSON.stringify(checkoutData)
    });
    orderId = checkoutRes.data.orderId;
    console.log('Response: Order created!', checkoutRes.data);
    console.log('-> PASS');

    // 8. Chuyển sang trang My Orders thấy trạng thái CONFIRMED
    console.log('\n[Step 8] Verify Customer Order Status (My Orders)');
    console.log('Request: GET /orders');
    const myOrdersRes = await fetchAPI('/orders', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    const myOrder = myOrdersRes.data.find(o => o.id === orderId);
    if (!myOrder) {
      console.log('Failed to find orderId', orderId, 'in', myOrdersRes.data);
    }
    console.log('Response: Order status is', myOrder.status);
    if (myOrder.status !== 'CONFIRMED') throw new Error(`Expected CONFIRMED but got ${myOrder.status}`);
    console.log('-> PASS');

    // 9. Đăng nhập Merchant
    console.log('\n[Step 9a] Merchant Login');
    console.log('Request: POST /auth/login { email: "merchant@foodiego.com", password: "password" }');
    const merchantLogin = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'merchant@foodiego.com', password: 'password' })
    });
    merchantToken = merchantLogin.data.token;
    console.log('Response: Merchant logged in. Token:', merchantToken.substring(0, 10) + '...');
    console.log('-> PASS');

    // Merchant Polling
    console.log('\n[Step 9b] Merchant Polling Orders');
    console.log('Request: GET /orders/merchant (Simulating 15s polling...)');
    await delay(2000);
    const merchantOrdersRes = await fetchAPI('/orders/merchant', {
      headers: { Authorization: `Bearer ${merchantToken}` }
    });
    const merchantOrder = merchantOrdersRes.data.find(o => o.id === orderId);
    console.log('Response: Order found on Merchant Dashboard! Status:', merchantOrder.status);
    console.log('-> PASS');

    // 9c. Nhấn "Prepare"
    console.log('\n[Step 9c] Merchant Clicks Prepare');
    console.log(`Request: PATCH /orders/${orderId}/status { status: 'PREPARING' }`);
    await fetchAPI(`/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${merchantToken}` },
      body: JSON.stringify({ status: 'PREPARING' })
    });
    console.log('Response: Order status updated to PREPARING');
    console.log('-> PASS');

    // 9d. Nhấn "Ready"
    console.log('\n[Step 9d] Merchant Clicks Ready');
    console.log(`Request: PATCH /orders/${orderId}/status { status: 'READY' }`);
    await fetchAPI(`/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${merchantToken}` },
      body: JSON.stringify({ status: 'READY' })
    });
    console.log('Response: Order status updated to READY');
    console.log('-> PASS');

    // 9e. Driver picks up (DELIVERING)
    console.log('\n[Step 9e] Driver Picks Up (DELIVERING)');
    console.log(`Request: PATCH /orders/${orderId}/status { status: 'DELIVERING' }`);
    await fetchAPI(`/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${merchantToken}` },
      body: JSON.stringify({ status: 'DELIVERING' })
    });
    console.log('Response: Order status updated to DELIVERING');
    console.log('-> PASS');

    // 9f. Nhấn "Completed"
    console.log('\n[Step 9f] Order Delivered (COMPLETED)');
    console.log(`Request: PATCH /orders/${orderId}/status { status: 'COMPLETED' }`);
    await fetchAPI(`/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${merchantToken}` },
      body: JSON.stringify({ status: 'COMPLETED' })
    });
    console.log('Response: Order status updated to COMPLETED');
    console.log('-> PASS');

    console.log('\n✅ ALL E2E UI NETWORK CALLS PASSED SUCESSFULLY');
  } catch (error) {
    console.error('\n❌ E2E FLOW FAILED');
    console.error(error.message);
  }
}

runE2E();
