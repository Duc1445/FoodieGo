async function testCart() {
  // 1. Login as customer-001
  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer-001@foodiego.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  if (!loginData.success) {
    console.log('Login failed:', loginData);
    return;
  }
  const token = loginData.data.token;
  console.log('Logged in, token:', token.substring(0, 20) + '...');

  // 2. Get a menu item from a restaurant
  const itemsRes = await fetch('http://localhost:3000/api/v1/menus/items', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const itemsData = await itemsRes.json();
  const menuItemId = itemsData.data[0].id;
  console.log('Found menu item:', menuItemId);

  // 3. Add to cart
  const cartRes = await fetch('http://localhost:3000/api/v1/cart/items', {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      menu_item_id: menuItemId,
      quantity: 1
    })
  });
  
  const cartText = await cartRes.text();
  console.log('Cart add response status:', cartRes.status);
  console.log('Cart add response:', cartText);
}

testCart().catch(console.error);
