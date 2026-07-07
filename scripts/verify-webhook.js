import fetch from 'node-fetch';
import crypto from 'crypto';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';

const WEBHOOK_URL = 'http://localhost:3005/webhook/payment';
const SECRET = 'mock-secret';
const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgres://foodiego:foodiego123@localhost:5432/foodiego',
});

function createPayload(status, reference, timestamp, webhookId) {
  const payloadObj = {
    id: webhookId,
    event: 'payment.updated',
    data: {
      tx_id: `mock_tx_${crypto.randomBytes(8).toString('hex')}`,
      reference,
      status,
    },
  };
  return JSON.stringify(payloadObj);
}

function signPayload(rawBody, secret) {
  return crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
}

async function run() {
  console.log('[Webhook Verify] Starting Verification...');

  // 1. Setup a dummy payment in the database
  const orderId = uuidv4();
  const paymentId = uuidv4();
  const idempotencyKey = uuidv4();

  await pool.query(
    `INSERT INTO payments (id, order_id, amount, currency, status, payment_method, idempotency_key) 
     VALUES ($1, $2, 100.00, 'USD', 'PENDING', 'CARD', $3)`,
    [paymentId, orderId, idempotencyKey],
  );
  console.log(`[Webhook Verify] Created mock PENDING payment: ${paymentId}`);

  // 2. Invalid Signature
  console.log('\n[Webhook Verify] Test 1: Invalid Signature');
  const ts1 = Math.floor(Date.now() / 1000);
  const webhookId1 = uuidv4();
  const rawBody1 = createPayload('AUTHORIZED', paymentId, ts1, webhookId1);
  const res1 = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-signature': 'invalid-hash-123',
      'x-timestamp': ts1.toString(),
      'x-webhook-id': webhookId1,
    },
    body: rawBody1,
  });
  if (res1.status === 403) console.log('  ✅ Passed: Rejected with 403');
  else console.error(`  ❌ Failed: Expected 403, got ${res1.status}`);

  // 3. Expired Timestamp
  console.log('\n[Webhook Verify] Test 2: Expired Timestamp');
  const ts2 = Math.floor(Date.now() / 1000) - 1000; // > 5 minutes ago
  const webhookId2 = uuidv4();
  const rawBody2 = createPayload('AUTHORIZED', paymentId, ts2, webhookId2);
  const sig2 = signPayload(rawBody2, SECRET);
  const res2 = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-signature': sig2,
      'x-timestamp': ts2.toString(),
      'x-webhook-id': webhookId2,
    },
    body: rawBody2,
  });
  if (res2.status === 403) console.log('  ✅ Passed: Rejected with 403');
  else console.error(`  ❌ Failed: Expected 403, got ${res2.status}`);

  // 4. Duplicate Webhooks (Concurrency)
  console.log('\n[Webhook Verify] Test 3: Duplicate Webhooks (Idempotency)');
  const ts3 = Math.floor(Date.now() / 1000);
  const webhookId3 = uuidv4();
  const rawBody3 = createPayload('AUTHORIZED', paymentId, ts3, webhookId3);
  const sig3 = signPayload(rawBody3, SECRET);

  const requests = [];
  const mockTraceparent = '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01';
  for (let i = 0; i < 10; i++) {
    requests.push(
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-signature': sig3,
          'x-timestamp': ts3.toString(),
          'x-webhook-id': webhookId3,
          traceparent: mockTraceparent,
        },
        body: rawBody3,
      }),
    );
  }

  const responses = await Promise.all(requests);
  const allOk = responses.every((r) => r.status === 200);
  if (allOk) console.log('  ✅ Passed: All 10 requests returned 200 OK');
  else console.error('  ❌ Failed: Some requests did not return 200 OK');

  // 5. Unknown Event
  console.log('\n[Webhook Verify] Test 4: Unknown Event');
  const ts4 = Math.floor(Date.now() / 1000);
  const webhookId4 = uuidv4();
  const payloadObj4 = {
    id: webhookId4,
    event: 'payment.unknown_action',
    data: { tx_id: 'mock_tx_unknown', reference: paymentId, status: 'UNKNOWN' },
  };
  const rawBody4 = JSON.stringify(payloadObj4);
  const sig4 = signPayload(rawBody4, SECRET);

  const res4 = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-signature': sig4,
      'x-timestamp': ts4.toString(),
      'x-webhook-id': webhookId4,
    },
    body: rawBody4,
  });
  if (res4.status === 200) console.log('  ✅ Passed: Acknowledged with 200 OK');
  else console.error(`  ❌ Failed: Expected 200, got ${res4.status}`);

  // Wait for the background worker to process the webhook
  console.log('\n[Webhook Verify] Waiting for background WebhookWorker (2s)...');
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Verify DB state
  console.log('\n[Webhook Verify] Querying Database Evidence...');
  const inboxCountRes = await pool.query(
    'SELECT COUNT(*) as cnt FROM webhook_inbox WHERE event_id = $1',
    [webhookId4],
  );
  console.log(`  Unknown Event Inbox Count: ${inboxCountRes.rows[0].cnt} (Expected: 1)`);

  const paymentRes = await pool.query('SELECT status FROM payments WHERE id = $1', [paymentId]);
  console.log(`  Payment Status: ${paymentRes.rows[0].status} (Expected: AUTHORIZED)`);

  const outboxRes = await pool.query(
    'SELECT event_type, status FROM outbox_events WHERE aggregate_id = $1',
    [paymentId],
  );
  console.log(`  Outbox Rows for Payment (${outboxRes.rows.length} total):`);
  outboxRes.rows.forEach((r) => console.log(`   - Event: ${r.event_type}, Status: ${r.status}`));

  if (outboxRes.rows.length === 1 && outboxRes.rows[0].event_type === 'PaymentAuthorized') {
    console.log(
      '  ✅ Passed: Exactly 1 PaymentAuthorized outbox event created (Duplicate & Unknown tests passed)',
    );
  } else {
    console.error('  ❌ Failed: Outbox does not match expectations');
  }

  const inboxDupRes = await pool.query(
    'SELECT traceparent, COUNT(*) as cnt FROM webhook_inbox WHERE event_id = $1 GROUP BY traceparent',
    [webhookId3],
  );
  if (inboxDupRes.rows.length === 1 && inboxDupRes.rows[0].cnt === '1') {
    console.log('  ✅ Passed: Exactly 1 webhook_inbox event recorded for Duplicate Webhook Test');
  } else {
    console.error('  ❌ Failed: Expected 1 webhook_inbox event for Duplicate Test');
  }

  if (inboxDupRes.rows.length > 0 && inboxDupRes.rows[0].traceparent) {
    console.log('  ✅ Passed: Webhook inbox traceparent propagated');
  } else {
    console.error(`  ❌ Failed: Expected traceparent in webhook_inbox`);
  }

  // Ensure invalid signature / replay did not insert into inbox
  const invalidInboxRes = await pool.query(
    'SELECT COUNT(*) as cnt FROM webhook_inbox WHERE event_id IN ($1, $2)',
    [webhookId1, webhookId2],
  );
  if (invalidInboxRes.rows[0].cnt === '0') {
    console.log('  ✅ Passed: Invalid signature and expired timestamp did not persist to inbox');
  } else {
    console.error('  ❌ Failed: Unauthorized requests were persisted to inbox');
  }

  console.log('\n[Webhook Verify] Done.');
  process.exit(0);
}

run().catch(console.error);
