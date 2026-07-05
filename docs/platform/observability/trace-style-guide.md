# Trace Style Guide

## Purpose
This document defines the tracing conventions for all FoodieGo services. Every developer and every service MUST follow these rules to ensure traces are consistent, readable, and useful across the entire distributed system.

---

## 1. When to Create a Manual Span

### ✅ Allowed (Business Capability or External Interaction)
Manual spans (`withSpan()`) are ONLY for operations that represent a **Business Capability** or an **External System Interaction**:

| Category | Examples |
|---|---|
| Business Workflow | `Checkout.Execute`, `Checkout.Validate`, `PricingPipeline.Calculate` |
| External Service Call | `RestaurantService.FetchMenu`, `IdentityService.VerifyToken` |
| Platform Operation | `Dispatcher.ProcessBatch`, `RetryManager.Route`, `ReplayCLI.Replay` |
| Data Mutation | `InventoryReservation.Reserve`, `PaymentAuthorization.Charge` |
| Async Processing | `OrderCreatedConsumer.Process`, `NotificationConsumer.Send` |

### ❌ Prohibited (Internal Logic)
Do NOT create spans for:
- Pure computation functions: `calculateSubtotal()`, `formatAddress()`
- Control flow: `if (...)`, `switch (...)`
- Iteration: `map()`, `forEach()`, `reduce()`
- Simple getters/setters
- Logging or validation helpers

> **Rule of Thumb**: If the operation doesn't cross a boundary (service, database, queue, cache) and doesn't represent a named business capability, it does NOT need a span.

---

## 2. Span Naming Convention

Format: `{ServiceOrComponent}.{Operation}`

### Examples
```
OrderService.Checkout
RestaurantService.Search
PricingPipeline.Calculate
Dispatcher.ProcessBatch
OrderCreatedConsumer.Process
PaymentService.Authorize
```

### Anti-Patterns (Prohibited)
```
# Too generic
Checkout
CreateOrder
Process

# HTTP route as span name
POST /api/v1/orders
GET /restaurants

# Lowercase single word
search
db
redis
```

---

## 3. Span Attributes (Semantic Conventions)

Always use OpenTelemetry Semantic Convention attribute names.

### HTTP Spans (Auto-instrumented)
| Attribute | Example |
|---|---|
| `http.request.method` | `GET`, `POST` |
| `http.response.status_code` | `200`, `500` |
| `url.path` | `/api/v1/orders` |

### Database Spans (Auto-instrumented)
| Attribute | Example |
|---|---|
| `db.system` | `postgresql` |
| `db.operation` | `SELECT`, `INSERT` |
| `db.collection` | `orders`, `outbox_events` |

### Messaging Spans
| Attribute | Example |
|---|---|
| `messaging.system` | `rabbitmq` |
| `messaging.destination` | `foodiego.orders` |
| `messaging.operation` | `publish`, `process` |
| `messaging.message.id` | UUID |

### Custom Business Attributes (Manual Spans)
| Attribute | Example |
|---|---|
| `order.item_count` | `5` |
| `pricing.total` | `125000` |
| `checkout.payment_method` | `COD` |

> **NEVER** put PII (user_id, email, phone, address) into span attributes.

---

## 4. Error Recording Policy

When an error occurs inside a span:
1. **Always** call `span.recordException(error)` — this attaches the stack trace to the span in Tempo.
2. **Always** call `span.setStatus({ code: SpanStatusCode.ERROR, message: error.message })` — this marks the span red in the trace waterfall.
3. **Also** log via `logger.error({ err }, 'message')` — this ensures the error is searchable in Loki.

```javascript
// ✅ Correct
try {
  await processOrder(order);
  span.setStatus({ code: SpanStatusCode.OK });
} catch (err) {
  span.recordException(err);
  span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
  logger.error({ err }, 'Order processing failed');
  throw err;
}

// ❌ Incorrect — only logging, Tempo won't show the error
try {
  await processOrder(order);
} catch (err) {
  console.error('Failed:', err);
}
```

---

## 5. Trace Continuity Rules

A single user action MUST produce **one trace** across all systems:

```
HTTP Request (Gateway)          ← Root Span
  └─ Proxy to Order Service     ← Auto (HTTP client)
      └─ OrderService.Checkout  ← Manual
          └─ Postgres INSERT    ← Auto
          └─ Outbox INSERT      ← Auto
              └─ Dispatcher     ← Inherits trace via outbox_events.trace_id
                  └─ RabbitMQ Publish  ← Inject traceparent into AMQP headers
                      └─ Consumer.Process  ← Extract traceparent, create child span
                          └─ Postgres UPDATE ← Auto
```

**Breaking the trace is a bug, not a feature.**
