# Baggage Policy

## Purpose
OpenTelemetry Baggage allows key-value pairs to propagate across service boundaries within a distributed trace. Because baggage is transmitted with **every request** downstream, it has performance and security implications. This policy defines what is allowed.

---

## 1. What is Baggage?

Baggage is a W3C standard mechanism for propagating contextual metadata alongside traces. Unlike span attributes (which are local to a single span), baggage items travel across process boundaries via HTTP headers and AMQP message properties.

```
Client → Gateway → OrderService → RabbitMQ → Consumer
         ↑ baggage propagated to all of these ↑
```

---

## 2. Allowed Baggage Keys (Whitelist)

Only the following keys are permitted in baggage:

| Key | Type | Description | Example |
|---|---|---|---|
| `tenant` | String | Multi-tenant identifier (future) | `foodiego-vn` |
| `locale` | String | User locale for i18n | `vi-VN`, `en-US` |
| `currency` | String | Active currency | `VND`, `USD` |
| `feature_flag` | String | Active feature flag for A/B testing | `new_checkout_v2` |
| `deployment.ring` | String | Canary/stable ring identifier | `canary`, `stable` |

---

## 3. Prohibited Baggage Keys

The following are **NEVER** allowed in baggage:

| Prohibited | Reason |
|---|---|
| `user_id` | PII — use span attributes with proper scope instead |
| `user_email` | PII |
| `jwt` / `token` | Security — tokens must never be propagated as baggage |
| `password` | Security |
| `cart_items` | Too large — baggage has size limits |
| `order_details` | Too large |
| `credit_card` | PCI-DSS violation |
| `phone` | PII |
| `address` | PII |

---

## 4. Baggage Size Limits

- **Maximum keys**: 10
- **Maximum key length**: 64 characters
- **Maximum value length**: 256 characters
- **Maximum total baggage size**: 2048 bytes

Exceeding these limits will cause the SDK to drop the baggage entry and log a warning.

---

## 5. SDK Enforcement

The `@foodiego/tracing` SDK will provide a baggage validator that:
1. Rejects any key not on the whitelist.
2. Strips any value exceeding the size limit.
3. Logs a `WARN` when baggage is rejected.

```javascript
// ✅ Allowed
baggage.setEntry('locale', { value: 'vi-VN' });
baggage.setEntry('currency', { value: 'VND' });

// ❌ Rejected by SDK (not on whitelist)
baggage.setEntry('user_email', { value: 'john@example.com' });
// Logs: [WARN] Baggage key "user_email" is not on the whitelist. Dropped.
```

---

## 6. When to Use Baggage vs. Span Attributes

| Use Case | Mechanism |
|---|---|
| Data needed by **downstream services** | Baggage |
| Data only relevant to the **current span** | Span Attribute |
| Sensitive data | **Neither** (log separately with redaction) |

> **Default to Span Attributes.** Only use Baggage when a downstream service genuinely needs the data to make a decision.
