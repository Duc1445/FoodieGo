import { spawn } from 'child_process';

async function verifyTrace() {
  console.log('[Verify Trace] Executing a test checkout flow to generate trace...');

  let traceId = null;

  // 1. Run verify-payment.js
  await new Promise((resolve, reject) => {
    const child = spawn('node', ['scripts/verify-payment.js']);

    child.stdout.on('data', (data) => {
      process.stdout.write(data);
      const output = data.toString();
      const match = output.match(/\[E2E\] Trace ID: ([a-f0-9]{32})/);
      if (match) {
        traceId = match[1];
      }
    });

    child.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    child.on('close', (code) => {
      if (code !== 0) reject(new Error('verify-payment.js failed'));
      else resolve();
    });
  });

  if (!traceId) {
    console.error('❌ Failed to capture Trace ID from verify-payment.js');
    process.exit(1);
  }

  // Wait for saga to process and spans to be exported
  console.log('[Verify Trace] Waiting 10 seconds for Saga and OTEL exporter to finish...');
  await new Promise((resolve) => setTimeout(resolve, 10000));

  console.log(`[Verify Trace] Fetching trace details for ${traceId}...`);
  const traceDetailRes = await fetch(`http://localhost:3200/api/traces/${traceId}`);
  const traceDetailData = await traceDetailRes.json();

  let services = new Set();
  let spans = new Set();

  let spanList = [];

  if (traceDetailData.batches) {
    for (const batch of traceDetailData.batches) {
      let serviceName = 'unknown';
      if (batch.resource && batch.resource.attributes) {
        const serviceNameAttr = batch.resource.attributes.find((a) => a.key === 'service.name');
        if (serviceNameAttr) {
          serviceName = serviceNameAttr.value.stringValue;
          services.add(serviceName);
        }
      }
      if (batch.scopeSpans) {
        for (const scopeSpan of batch.scopeSpans) {
          if (scopeSpan.spans) {
            for (const span of scopeSpan.spans) {
              spans.add(span.name);
              spanList.push({ ...span, serviceName });
            }
          }
        }
      }
    }
  }

  console.log(`\n[Verify Trace] Trace Hierarchy (Tempo Equivalent):`);
  const rootSpans = spanList.filter((s) => !s.parentSpanId);
  const printSpan = (span, indent = '') => {
    console.log(`${indent}✔ [${span.serviceName}] ${span.name} (${span.spanId})`);
    const children = spanList.filter((s) => s.parentSpanId === span.spanId);
    for (const child of children) {
      printSpan(child, indent + '  ');
    }
  };
  for (const root of rootSpans) {
    printSpan(root);
  }
  console.log('\n');

  console.log(`[Verify Trace] Services involved in this trace:`, Array.from(services));
  console.log(`[Verify Trace] Distinct Spans in this trace:`, Array.from(spans));

  if (
    services.has('order-service') &&
    services.has('inventory-service') &&
    services.has('payment-service')
  ) {
    console.log(
      '✅ Distributed Tracing Verified! All services are successfully recorded in the same trace in Tempo.',
    );
  } else {
    console.error('❌ Missing expected services in trace. Found:', Array.from(services));
    process.exit(1);
  }

  // Assert presence of Webhook spans
  const requiredWebhookSpans = [
    'Webhook Receive',
    'Verify Signature',
    'Persist Inbox',
    'Webhook Worker',
    'Payment Service',
    'Outbox Dispatcher',
    'RabbitMQ Publish',
  ];

  const missingWebhookSpans = requiredWebhookSpans.filter((spanName) => !spans.has(spanName));
  if (missingWebhookSpans.length > 0) {
    console.error('❌ Missing expected webhook spans in trace:', missingWebhookSpans);
    process.exit(1);
  } else {
    console.log('✅ Webhook Sequence Trace Verified! Required webhook spans are present.');
  }
}

verifyTrace().catch(console.error);
