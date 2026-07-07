import fetch from 'node-fetch';
import pg from 'pg';
import crypto from 'crypto';

const { Pool } = pg;
const ORDER_SERVICE_URL = 'http://localhost:3000/api/v1';
const USER_ID = '11111111-1111-1111-1111-111111111111';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('[Verify Retry] Starting Retry & DLQ Verification...');

  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL || 'postgres://foodiego:foodiego123@localhost:5432/foodiego',
  });

  // Setup a special item with price 10.06 to trigger FAST_TIMEOUT
  const specialItemId = '10000000-0000-0000-0000-000000000100';
  await pool.query(
    "INSERT INTO menu_items (id, restaurant_id, category_id, name, price, preparation_time) VALUES ($1, '20000000-0000-0000-0000-000000000200', '30000000-0000-0000-0000-000000000300', 'Timeout Item', 10.06, 20) ON CONFLICT (id) DO UPDATE SET price = 10.06;",
    [specialItemId],
  );
  await pool.query(
    'INSERT INTO inventory_stock (stock_item_id, total_quantity, reserved_quantity) VALUES ($1, 100, 0) ON CONFLICT (stock_item_id) DO UPDATE SET total_quantity = 100;',
    [specialItemId],
  );

  // Clear cart first to avoid left-over invalid items
  await fetch(`${ORDER_SERVICE_URL}/cart`, {
    method: 'DELETE',
    headers: { 'x-user-id': USER_ID },
  });

  // 1. Add to Cart
  const cartRes = await fetch(`${ORDER_SERVICE_URL}/cart/items`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': USER_ID,
    },
    body: JSON.stringify({
      menu_item_id: specialItemId,
      quantity: 1,
    }),
  });
  const cartData = await cartRes.json();
  if (!cartRes.ok) {
    console.error('[Verify Retry] Failed to add item to cart:', cartData);
    process.exit(1);
  }

  // 2. Checkout with TIMEOUT_TEST payment method
  const checkoutRes = await fetch(`${ORDER_SERVICE_URL}/orders/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': USER_ID,
      'idempotency-key': 'retry-test-' + Date.now(),
    },
    body: JSON.stringify({
      paymentMethod: 'TIMEOUT_TEST',
      addressId: null,
      cartVersion: cartData.data.version,
    }),
  });
  const checkoutData = await checkoutRes.json();
  if (!checkoutRes.ok) {
    console.error(`[Verify Retry] Failed to checkout: ${checkoutRes.status}`, checkoutData);
    process.exit(1);
  }

  console.log(
    `[Verify Retry] Checkout successful! Waiting for retry mechanism to kick in (approx 8-10s)...`,
  );
  await sleep(8000);

  // 4. Verify Metrics
  const metricsRes = await fetch('http://localhost:3005/metrics');
  const metricsText = await metricsRes.text();

  const timeoutLine = metricsText.split('\n').find((l) => l.startsWith('payment_timeout_total'));
  const retryLine = metricsText.split('\n').find((l) => l.startsWith('payment_retry_total'));

  const hasTimeoutMetric = timeoutLine && parseInt(timeoutLine.split(' ')[1]) > 0;
  const hasRetryMetric = retryLine && parseInt(retryLine.split(' ')[1]) > 0;

  if (hasRetryMetric && hasTimeoutMetric) {
    console.log(
      '✅ Passed: payment_timeout_total and payment_retry_total metrics > 0 found in /metrics',
    );
    console.log(`  -> ${timeoutLine}`);
    console.log(`  -> ${retryLine}`);
  } else {
    console.error('❌ Failed: Missing retry or timeout metrics, or value is 0');
    console.log(metricsText.split('\n').filter((l) => l.includes('payment_')));
  }

  // 5. Verify RabbitMQ DLQ/Retry Queues existence via Management API
  const mqHeaders = {
    Authorization: 'Basic ' + Buffer.from('guest:guest').toString('base64'),
  };
  const mqRes = await fetch('http://localhost:15672/api/queues', { headers: mqHeaders });
  if (mqRes.ok) {
    const queues = await mqRes.json();
    const retryQueues = queues.filter((q) => q.name.includes('retry.queue.PaymentRequested'));
    if (retryQueues.length > 0) {
      console.log(
        '✅ Passed: RabbitMQ delayed retry queues successfully created for PaymentRequested.',
      );
      retryQueues.forEach((q) =>
        console.log(`  - Found queue: ${q.name} with ${q.messages} messages`),
      );
    } else {
      console.error('❌ Failed: No retry queues found for PaymentRequested in RabbitMQ.');
    }
  } else {
    console.error(`[Verify Retry] Could not query RabbitMQ Management API: ${mqRes.status}`);
  }

  console.log('\n[Verify Retry] Done.');
  process.exit(0);
}

run().catch(console.error);
