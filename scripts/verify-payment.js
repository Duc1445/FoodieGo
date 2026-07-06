import pg from 'pg';
import crypto from 'crypto';

const { Pool } = pg;
const ORDER_SERVICE_URL = 'http://localhost:3000/api/v1';
const USER_ID = '11111111-1111-1111-1111-111111111111';
const MENU_ITEM_ID = '10000000-0000-0000-0000-000000000100';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log(`[E2E] Starting E2E Payment Verification Flow...`);

  // 0. Ensure item and user exist
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL || 'postgres://foodiego:foodiego123@localhost:5432/foodiego',
  });
  await pool.query(
    "INSERT INTO users (id, email, password, full_name) VALUES ('11111111-1111-1111-1111-111111111111', 'test@test.com', 'pwd', 'Test') ON CONFLICT DO NOTHING;",
  );
  await pool.query(
    "INSERT INTO restaurants (id, name, description, status, delivery_fee) VALUES ('20000000-0000-0000-0000-000000000200', 'Test', 'Test', 'open', 15000) ON CONFLICT DO NOTHING;",
  );
  await pool.query(
    "INSERT INTO categories (id, restaurant_id, name, description) VALUES ('30000000-0000-0000-0000-000000000300', '20000000-0000-0000-0000-000000000200', 'Test', 'Test') ON CONFLICT DO NOTHING;",
  );
  await pool.query(
    "INSERT INTO menu_items (id, restaurant_id, category_id, name, price, preparation_time) VALUES ('10000000-0000-0000-0000-000000000100', '20000000-0000-0000-0000-000000000200', '30000000-0000-0000-0000-000000000300', 'Payment Test Item', 10.01, 20) ON CONFLICT (id) DO UPDATE SET price = 10.01;",
  );
  await pool.query(
    "INSERT INTO inventory_stock (stock_item_id, total_quantity, reserved_quantity) VALUES ('10000000-0000-0000-0000-000000000100', 100, 0) ON CONFLICT (stock_item_id) DO UPDATE SET total_quantity = 100;",
  );

  // 1. Add to Cart
  console.log(`[E2E] Adding item to cart...`);
  const traceIdHex = Buffer.from(Date.now().toString() + Math.random().toString())
    .toString('hex')
    .padEnd(32, '0')
    .slice(0, 32);
  const spanIdHex = Buffer.from(Math.random().toString())
    .toString('hex')
    .padEnd(16, '0')
    .slice(0, 16);
  const traceparent = `00-${traceIdHex}-${spanIdHex}-01`;

  const cartRes = await fetch(`${ORDER_SERVICE_URL}/cart/items`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': USER_ID,
      'x-trace-id': `e2e-trace-${Date.now()}`,
      traceparent: traceparent,
    },
    body: JSON.stringify({
      menu_item_id: MENU_ITEM_ID,
      quantity: 1,
    }),
  });

  if (!cartRes.ok) {
    console.error(`[E2E] Failed to add item to cart: ${cartRes.status}`);
    process.exit(1);
  }

  const cartData = await cartRes.json();

  // 2. Checkout
  console.log(`[E2E] Checking out...`);
  const idempotencyKey = crypto.randomUUID();
  const checkoutRes = await fetch(`${ORDER_SERVICE_URL}/orders/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': USER_ID,
      'x-trace-id': `e2e-trace-${Date.now()}`,
      traceparent: traceparent,
      'idempotency-key': idempotencyKey,
    },
    body: JSON.stringify({
      cartVersion: cartData.data.version,
      addressId: '12345678-1234-1234-1234-123456789012',
      paymentMethod: 'CARD', // Using CARD to trigger gateway logic
    }),
  });

  if (!checkoutRes.ok) {
    console.error(`[E2E] Failed to checkout: ${checkoutRes.status}`);
    process.exit(1);
  }

  const checkoutData = await checkoutRes.json();
  const orderId = checkoutData.data.orderId;
  console.log(`[E2E] Checkout successful! Order ID: ${orderId}`);

  // 3. Poll DB for status

  try {
    console.log(
      `[E2E] Waiting for Saga (Order -> Inventory -> Order -> Payment -> Order) to complete...`,
    );
    let orderStatus = 'CREATED';
    for (let i = 0; i < 40; i++) {
      const { rows } = await pool.query('SELECT status FROM orders WHERE id = $1', [orderId]);
      if (rows.length > 0) {
        orderStatus = rows[0].status;
        if (orderStatus === 'PAID' || orderStatus === 'CANCELLED') {
          break;
        }
      }
      await sleep(500);
    }

    if (orderStatus !== 'PAID') {
      console.error(`[E2E] ❌ Order failed to reach PAID. Current status: ${orderStatus}`);
      process.exit(1);
    }
    console.log(`[E2E] ✅ Order reached PAID!`);

    // Verify Payment Record
    console.log(`[E2E] Verifying Payment Record...`);
    const { rows: paymentRows } = await pool.query(
      'SELECT status, gateway_tx_id FROM payments WHERE order_id = $1',
      [orderId],
    );
    if (paymentRows.length > 0) {
      console.log(`  - Payment Status: ${paymentRows[0].status}`);
      console.log(`  - Gateway Tx ID: ${paymentRows[0].gateway_tx_id}`);
      if (paymentRows[0].status !== 'AUTHORIZED') {
        console.error(`  - ❌ Expected AUTHORIZED but got ${paymentRows[0].status}`);
      } else {
        console.log(`  - ✅ Payment is AUTHORIZED`);
      }
    } else {
      console.error(`  - ❌ Missing payment record!`);
    }

    console.log(`[E2E] Verification completed successfully.`);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
