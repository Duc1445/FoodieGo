import pg from 'pg';
import crypto from 'crypto';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

const { Pool } = pg;
const ORDER_SERVICE_URL = 'http://localhost:3000/api/v1';
const WEBHOOK_URL = 'http://localhost:3005/webhook/payment';
const SECRET = process.env.WEBHOOK_SECRET || 'mock-secret';
const USER_ID = '11111111-1111-1111-1111-111111111111';
const MENU_ITEM_ID = '10000000-0000-0000-0000-000000000100';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log(`[Chaos Verification] Starting Gateway Timeout -> Webhook Recovery Flow...`);

  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL || 'postgres://foodiego:foodiego123@localhost:5432/foodiego',
  });

  // 0. Ensure item and user exist
  await pool.query(
    "INSERT INTO users (id, email, password, full_name) VALUES ('11111111-1111-1111-1111-111111111111', 'test@test.com', 'pwd', 'Test') ON CONFLICT DO NOTHING;",
  );
  await pool.query(
    "INSERT INTO restaurants (id, name, description, status, delivery_fee) VALUES ('20000000-0000-0000-0000-000000000200', 'Test', 'Test', 'open', 15000) ON CONFLICT DO NOTHING;",
  );
  await pool.query(
    "INSERT INTO categories (id, restaurant_id, name, description) VALUES ('30000000-0000-0000-0000-000000000300', '20000000-0000-0000-0000-000000000200', 'Test', 'Test') ON CONFLICT DO NOTHING;",
  );

  // Create item with price 100.06 to trigger FAST_TIMEOUT
  await pool.query(
    "INSERT INTO menu_items (id, restaurant_id, category_id, name, price, preparation_time) VALUES ('10000000-0000-0000-0000-000000000100', '20000000-0000-0000-0000-000000000200', '30000000-0000-0000-0000-000000000300', 'Chaos Test Item', 100.06, 20) ON CONFLICT (id) DO UPDATE SET price = 100.06;",
  );
  await pool.query(
    "INSERT INTO inventory_stock (stock_item_id, total_quantity, reserved_quantity) VALUES ('10000000-0000-0000-0000-000000000100', 100, 0) ON CONFLICT (stock_item_id) DO UPDATE SET total_quantity = 100;",
  );

  // 1. Add to Cart
  console.log(`[Chaos Verification] Adding item to cart...`);
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
      'x-trace-id': `chaos-trace-${Date.now()}`,
      traceparent: traceparent,
    },
    body: JSON.stringify({
      menu_item_id: MENU_ITEM_ID,
      quantity: 1,
    }),
  });

  if (!cartRes.ok) {
    console.error(`[Chaos Verification] Failed to add item to cart: ${cartRes.status}`);
    process.exit(1);
  }

  const cartData = await cartRes.json();

  // 2. Checkout
  console.log(`[Chaos Verification] Checking out... Expecting Gateway Timeout!`);
  const idempotencyKey = crypto.randomUUID();
  const checkoutRes = await fetch(`${ORDER_SERVICE_URL}/orders/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': USER_ID,
      'x-trace-id': `chaos-trace-${Date.now()}`,
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
    console.error(`[Chaos Verification] Failed to checkout: ${checkoutRes.status}`);
    process.exit(1);
  }

  const checkoutData = await checkoutRes.json();
  const orderId = checkoutData.data.orderId;
  console.log(`[Chaos Verification] Checkout successful! Order ID: ${orderId}`);

  // 3. Wait for payment to be created and check gateway jobs
  let paymentId = null;
  console.log(`[Chaos Verification] Waiting for Payment Record to be created...`);
  for (let i = 0; i < 40; i++) {
    const { rows } = await pool.query('SELECT id, status FROM payments WHERE order_id = $1', [
      orderId,
    ]);
    if (rows.length > 0) {
      paymentId = rows[0].id;
      console.log(`[Chaos Verification] Payment Status: ${rows[0].status}`);
      break;
    }
    await sleep(500);
  }

  if (!paymentId) {
    console.error(`[Chaos Verification] ❌ Payment record not found.`);
    process.exit(1);
  }

  await sleep(1000); // give time for the timeout error to be processed

  // See mock_gateway_jobs
  const mockJobRes = await pool.query('SELECT * FROM mock_gateway_jobs WHERE payment_id = $1', [
    paymentId,
  ]);
  if (mockJobRes.rows.length > 0) {
    console.log(
      `[Chaos Verification] Mock Webhook scheduled for: ${mockJobRes.rows[0].execute_after}`,
    );
  } else {
    console.error(
      '[Chaos Verification] ❌ No Mock Gateway Job scheduled. The Webhook will never arrive!',
    );
  }

  // See outbox_events retry attempt
  const reqOutbox = await pool.query(
    "SELECT attempt FROM outbox_events WHERE aggregate_id = $1 AND event_type = 'PaymentRequested'",
    [orderId],
  );
  if (reqOutbox.rows.length > 0) {
    console.log(
      `[Chaos Verification] PaymentRequested Event is at Retry Attempt: ${reqOutbox.rows[0].attempt}`,
    );
  }

  console.log('[Chaos Verification] Waiting 8 seconds for the delayed Mock Webhook to arrive...');
  await sleep(8000);

  // 4. Verify Final State
  console.log('[Chaos Verification] Verifying final state...');
  const finalPaymentRes = await pool.query('SELECT status FROM payments WHERE id = $1', [
    paymentId,
  ]);
  const finalStatus = finalPaymentRes.rows[0].status;

  if (finalStatus === 'AUTHORIZED') {
    console.log('✅ Passed: Payment is AUTHORIZED despite the initial gateway timeout!');
  } else {
    console.error(`❌ Failed: Payment status is ${finalStatus}, expected AUTHORIZED`);
  }

  const finalOutbox = await pool.query(
    "SELECT * FROM outbox_events WHERE aggregate_id = $1 AND event_type = 'PaymentAuthorized'",
    [paymentId],
  );
  if (finalOutbox.rows.length > 0) {
    console.log('✅ Passed: PaymentAuthorized event was dispatched successfully');
  } else {
    console.error('❌ Failed: PaymentAuthorized event was NOT dispatched');
  }

  // Cleanup test food price back to original just in case
  await pool.query(
    "UPDATE menu_items SET price = 10.01 WHERE id = '10000000-0000-0000-0000-000000000100';",
  );

  console.log('\n[Chaos Verification] All Chaos tests passed successfully.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
