# Observability Foundation — Beta Evidence: Trace Quality

## KPI Targets & Status

| KPI | Target | Status |
|---|---|---|
| Trace Completeness | ≥ 99% | ⏳ Pending E2E verification |
| Broken Trace Rate | < 0.5% | ⏳ Pending E2E verification |
| Orphan Span Rate | 0% | ✅ Architecture enforces via `withSpan()` + auto-instrumentation |
| Missing Parent Rate | 0% | ✅ `RabbitMQAdapter` injects/extracts `traceparent` on all AMQP messages |
| Context Propagation Coverage | 100% | ✅ All 3 services + Messaging Runtime use `@foodiego/tracing` with W3C propagator |
| Error Span Accuracy | 100% | ✅ Trace Style Guide mandates `recordException()` + `setStatus(ERROR)` |

## Architecture Guarantees

### Why Broken Traces Should Not Occur
1. `initTracing()` is called **before** all other imports in every service entrypoint.
2. `W3CTraceContextPropagator` is the only propagator — no custom formats.
3. Auto-instrumentation for `express`, `http`, `pg`, `ioredis`, `amqplib` is enabled.
4. Manual spans use `tracer.startActiveSpan()` which always respects `context.active()`.

### Why AMQP Context Should Propagate
1. `RabbitMQAdapter.publish()` calls `propagation.inject(context.active(), traceHeaders)` → injects `traceparent` into message headers.
2. `RabbitMQAdapter.registerConsumer()` calls `propagation.extract()` on incoming AMQP message headers → creates child span in the extracted context.
3. Consumer business logic runs inside `context.with(parentContext, ...)` ensuring all downstream spans inherit the parent trace.

## Verification Plan

### Step 1: Start Full Stack
```bash
docker compose up -d
```

### Step 2: Trigger E2E Flow
```bash
# Create an order that triggers the full path
curl -X POST http://localhost:3000/api/v1/cart/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"restaurantId": "...", "itemId": "...", "quantity": 1}'

curl -X POST http://localhost:3000/api/v1/orders/checkout \
  -H "Authorization: Bearer <token>"
```

### Step 3: Verify in Tempo
1. Open Grafana at `http://localhost:3100`.
2. Navigate to Explore → Tempo.
3. Search for recent traces.
4. Verify the trace contains spans from:
   - `gateway` (root)
   - `order-service` (child)
   - `postgresql` (child — auto)
   - `Dispatcher.ProcessBatch` (child — manual)
   - `{Consumer}.Process` (child — extracted from AMQP)

### Step 4: Verify Trace-to-Log
1. Click on any span in Tempo.
2. Click "View Logs" link.
3. Verify Loki opens with `traceId` filter showing correlated logs.

> **Results will be appended here after runtime execution.**
