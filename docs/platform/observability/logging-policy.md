# Logging & PII Policy

## Purpose
This document defines the structured logging conventions and PII (Personally Identifiable Information) handling policy for all FoodieGo services. The `@foodiego/logging` SDK enforces these rules automatically wherever possible.

---

## 1. Structured Logging Format

All logs MUST be JSON. The following fields are standard:

| Field | Type | Source | Description |
|---|---|---|---|
| `timestamp` | ISO 8601 | SDK (auto) | When the log was emitted |
| `severity` | String | SDK (auto) | `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL` |
| `service` | String | SDK (auto) | Service name from ENV |
| `environment` | String | SDK (auto) | `development`, `staging`, `production` |
| `traceId` | String | SDK (auto) | OpenTelemetry trace ID from active context |
| `spanId` | String | SDK (auto) | OpenTelemetry span ID from active context |
| `requestId` | String | Middleware (auto) | Unique request identifier from `x-request-id` header |
| `message` | String | Developer | Human-readable description |
| `duration` | Number | Developer/Middleware | Operation duration in ms |
| `err.type` | String | SDK (auto via serializer) | Exception class name |
| `err.message` | String | SDK (auto via serializer) | Error message |
| `err.stack` | String | SDK (auto via serializer) | Stack trace |

### Example Output
```json
{
  "severity": "INFO",
  "timestamp": "2026-07-05T09:00:00.000Z",
  "service": "order-service",
  "environment": "production",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "requestId": "req-abc-123",
  "message": "Checkout completed",
  "duration": 142
}
```

---

## 2. Log Levels

| Level | Usage |
|---|---|
| `DEBUG` | Detailed diagnostic info (disabled in production by default) |
| `INFO` | Normal operations: request completed, event published, order created |
| `WARN` | Recoverable issues: cache miss, retry triggered, slow query |
| `ERROR` | Failures requiring attention: consumer crash, payment declined, DB timeout |
| `FATAL` | Unrecoverable: service cannot start, missing critical config |

---

## 3. PII Policy

### ❌ NEVER Log (Absolute Prohibition)

| Data Type | Examples |
|---|---|
| Passwords | `password`, `secret`, `pin` |
| JWT Tokens | `Authorization` header value, refresh tokens |
| Full Email | `john.doe@gmail.com` |
| Full Phone | `+84901234567` |
| Credit/Debit Card | PAN, CVV, expiry |
| Full Address | Street address, apartment number |
| National ID | SSN, CCCD, passport number |
| IP Address (in non-security context) | `req.ip` |

### ✅ Allowed to Log (After Redaction)

| Data Type | Redacted Format | Example |
|---|---|---|
| Email | `j***@gmail.com` | Mask local part |
| Phone | `+84***4567` | Show last 4 digits |
| Name | `John D.` | First name + initial |
| Order ID | Full UUID | Non-PII identifier |
| User ID | Full UUID | Non-PII identifier |

### SDK Enforcement

The `@foodiego/logging` SDK provides a built-in **PII redactor** that automatically masks known PII patterns in log output:

```javascript
import { createLogger } from '@foodiego/logging';
const logger = createLogger();

// The SDK will automatically redact known patterns
logger.info({ email: 'john@example.com' }, 'User action');
// Output: { email: 'j***@example.com', ... }
```

Redaction rules are applied via Pino serializers/hooks and cover:
- Fields named `email`, `phone`, `password`, `token`, `authorization`, `credit_card`, `address`
- JWT-like strings (`eyJ...`) in any field

---

## 4. What NOT to Log

```javascript
// ❌ Never do this
logger.info({ body: req.body }, 'Request received');
// req.body may contain passwords, tokens, credit cards

// ❌ Never do this
logger.info({ headers: req.headers }, 'Headers');
// Authorization header contains JWT

// ✅ Instead, log only what you need
logger.info({
  method: req.method,
  path: req.path,
  userId: req.user?.id
}, 'Request received');
```

---

## 5. Log Retention

| Environment | Retention |
|---|---|
| Development | Session only (stdout) |
| Staging | 7 days |
| Production | 30 days (ERROR/FATAL: 90 days) |
