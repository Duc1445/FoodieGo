import { execSync } from 'child_process';
import crypto from 'crypto';

async function verifyTrace() {
  console.log('[Verify Trace] Executing a test checkout flow to generate trace...');
  
  const userId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
  
  // 1. Add to cart
  const cartRes = await fetch('http://localhost:3000/api/v1/cart/items', {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-id': userId
    },
    body: JSON.stringify({ 
      menu_item_id: '10000000-0000-0000-0000-000000000100',
      quantity: 1
    })
  });
  
  const cartData = await cartRes.json();
  if (cartRes.status !== 200) {
    console.error('Failed to add to cart:', cartData);
    process.exit(1);
  }
  const cartVersion = cartData.data.version;

  // 2. Checkout
  const checkoutRes = await fetch('http://localhost:3000/api/v1/orders/checkout', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-id': userId,
      'idempotency-key': crypto.randomUUID()
    },
    body: JSON.stringify({ 
      cartVersion: cartVersion,
      addressId: '12345678-1234-1234-1234-123456789012',
      paymentMethod: 'CASH'
    })
  });
  const checkoutData = await checkoutRes.json();
  console.log('Checkout response:', checkoutData);

  // Wait for saga to process
  console.log('[Verify Trace] Waiting 5 seconds for Saga and OTEL exporter to finish...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('[Verify Trace] Fetching traces from Tempo...');
  const searchRes = await fetch('http://localhost:3200/api/search');
  const searchData = await searchRes.json();
  
  if (!searchData.traces || searchData.traces.length === 0) {
    console.error('❌ Tempo Search Failed: No traces found.');
    process.exit(1);
  }

  const orderTrace = searchData.traces.find(t => t.rootServiceName === 'order-service');
  if (!orderTrace) {
    console.error('❌ Tempo Search Failed: No order-service trace found.');
    process.exit(1);
  }

  // Pick the most recent trace
  const traceId = orderTrace.traceID;
  console.log(`[Verify Trace] Found Trace ID: ${traceId}`);

  console.log(`[Verify Trace] Fetching trace details...`);
  const traceDetailRes = await fetch(`http://localhost:3200/api/traces/${traceId}`);
  const traceDetailData = await traceDetailRes.json();
  
  let services = new Set();
  
  if (traceDetailData.batches) {
    for (const batch of traceDetailData.batches) {
      if (batch.resource && batch.resource.attributes) {
        const serviceNameAttr = batch.resource.attributes.find(a => a.key === 'service.name');
        if (serviceNameAttr) {
          services.add(serviceNameAttr.value.stringValue);
        }
      }
    }
  }

  console.log(`[Verify Trace] Services involved in this trace:`, Array.from(services));
  
  if (services.has('order-service')) {
    console.log('✅ Distributed Tracing Verified! Spans are successfully recorded in Tempo.');
  } else {
    console.error('❌ Missing expected services in trace. Found:', Array.from(services));
    process.exit(1);
  }
}

verifyTrace();
