import http from 'http';

const GATEWAY_URL = 'http://localhost:3000/api';

function fetchApi(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${GATEWAY_URL}${endpoint}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function sendAnalytics(event, data) {
  await fetchApi('/analytics/events', 'POST', { event, data });
}

async function runDemo() {
  console.log('🚀 Bắt đầu giả lập hành vi người dùng (Sprint B1 Discovery)...');
  
  // 1. Mở App -> Load nhà hàng
  console.log('\n--- Bước 1: Mở App (Load Restaurants) ---');
  let startTime = Date.now();
  const resList = await fetchApi('/restaurants?search=Pizza');
  let latency = Date.now() - startTime;
  console.log(`[GET /restaurants] Latency: ${latency}ms (KPI < 2000ms) - Status: ${resList.status}`);
  await sendAnalytics('HomeViewed', { search: 'Pizza', count: resList.data.data?.length });
  
  if (!resList.data.data || resList.data.data.length === 0) {
    console.log('❌ Không tìm thấy nhà hàng nào. Dừng Demo.');
    return;
  }
  
  const targetRestaurant = resList.data.data[0];
  console.log(`=> Chọn nhà hàng: ${targetRestaurant.name} (${targetRestaurant.id})`);

  // 2. Mở chi tiết nhà hàng
  console.log('\n--- Bước 2: Xem Chi tiết nhà hàng ---');
  startTime = Date.now();
  const resDetail = await fetchApi(`/restaurants/${targetRestaurant.id}`);
  latency = Date.now() - startTime;
  console.log(`[GET /restaurants/:id] Latency: ${latency}ms (KPI < 1500ms) - Status: ${resDetail.status}`);
  await sendAnalytics('RestaurantViewed', { restaurant_id: targetRestaurant.id, name: targetRestaurant.name });

  // 3. Load Menu (Group by Category)
  console.log('\n--- Bước 3: Tải Menu ---');
  startTime = Date.now();
  const menuRes = await fetchApi(`/restaurants/${targetRestaurant.id}/menu`);
  latency = Date.now() - startTime;
  console.log(`[GET /restaurants/:id/menu] Latency: ${latency}ms (KPI < 1000ms) - Status: ${menuRes.status}`);
  await sendAnalytics('MenuViewed', { restaurant_id: targetRestaurant.id, total_categories: menuRes.data.data?.length });

  console.log('\n✅ Demo hoàn tất! Khách hàng đã quyết định xong món ăn trong vòng < 30s.');
}

runDemo().catch(console.error);
