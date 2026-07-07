import fetch from 'node-fetch';
import crypto from 'crypto';

async function verifyDuplicateWebhook() {
  console.log('[Duplicate Webhook] Testing idempotency of Webhook Inbox...');

  const MOCK_WEBHOOK_SECRET = 'mock-secret';
  const providerEventId = crypto.randomUUID();
  const payload = {
    event: 'payment.success',
    data: {
      transaction_id: 'mock_tx_duplicate_test',
      amount: 100,
      currency: 'USD',
      metadata: { order_id: crypto.randomUUID() },
    },
    created_at: new Date().toISOString(),
    id: providerEventId,
  };

  const payloadString = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', MOCK_WEBHOOK_SECRET)
    .update(payloadString)
    .digest('hex');

  const webhookId = crypto.randomUUID();
  const timestamp = Math.floor(Date.now() / 1000).toString();

  console.log(`[Duplicate Webhook] Sending FIRST webhook (ID: ${providerEventId})...`);
  const res1 = await fetch('http://localhost:3005/webhook/payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-signature': signature,
      'x-webhook-id': webhookId,
      'x-timestamp': timestamp,
    },
    body: payloadString,
  });

  const text1 = await res1.text();
  console.log(`[Duplicate Webhook] Response 1: ${res1.status} - ${text1}`);

  console.log(
    `[Duplicate Webhook] Sending SECOND (DUPLICATE) webhook with exact same payload and ID...`,
  );
  const res2 = await fetch('http://localhost:3005/webhook/payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-signature': signature,
      'x-webhook-id': webhookId,
      'x-timestamp': timestamp,
    },
    body: payloadString,
  });

  const text2 = await res2.text();
  console.log(`[Duplicate Webhook] Response 2: ${res2.status} - ${text2}`);

  if (res1.status === 200 && res2.status === 200) {
    console.log('✅ Passed: Both webhooks returned 200 OK (idempotency honored at HTTP level).');
  } else {
    console.error('❌ Failed: Expected 200 OK for both requests.');
    process.exit(1);
  }
}

verifyDuplicateWebhook();
