import axios from 'axios';

const GATEWAY_URL = 'http://localhost:3000/api/v1';

async function run() {
  console.log('--- Bắt đầu Beta E2E Trace Validation ---');

  try {
    const headers = { 'x-user-id': '11111111-1111-1111-1111-111111111111' };

    // Thêm vào giỏ hàng
    console.log('Sending: PUT /cart/items');
    await axios.put(
      `${GATEWAY_URL}/cart/items`,
      {
        restaurantId: '11111111-1111-1111-1111-111111111111',
        itemId: 'b353da6c-3e0e-4363-8a03-7b3b4d4715f3',
        quantity: 1,
      },
      { headers },
    );
    console.log('✅ Đã thêm vào giỏ hàng');

    // Checkout (Trigger Order -> RabbitMQ -> Consumer)
    console.log('Sending: POST /orders/checkout');
    const checkoutRes = await axios.post(`${GATEWAY_URL}/orders/checkout`, {}, { headers });
    console.log(`✅ Đã checkout thành công. Order ID: ${checkoutRes.data.data.orderId}`);

    // In ra Request ID để tiện trace log
    console.log(`\n🎉 E2E Flow hoàn tất!`);
    console.log(
      `Hãy mở Grafana Tempo và tìm Trace ID / Request ID tương ứng trong log của order-service.`,
    );
  } catch (err) {
    console.error('❌ Lỗi E2E:', err.response?.data || err.message);
  }
}

run();
