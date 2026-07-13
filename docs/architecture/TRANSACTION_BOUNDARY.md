# Transaction Boundary Report

## Overview
This document outlines the exact `BEGIN` and `COMMIT` boundaries for critical business flows, detailing every operation within the transaction to ensure data consistency and atomicity.

---

## Checkout Flow: Order Creation

### Findings

```text
FACT
--------
Order creation transaction includes idempotency and outbox events.

EVIDENCE
--------
- File: apps/order-service/src/modules/checkout/repositories/checkout.repository.js
- Line: 22
- Snippet: `await client.query('BEGIN');`
- Line: 138
- Snippet: `await client.query('COMMIT');`

Transaction Boundary:
Checkout Request
   ↓
BEGIN
Isolation Level: NOT FOUND (Default PostgreSQL assumed)
   ↓
INSERT idempotency_keys
   ↓
INSERT orders
   ↓
INSERT order_items
   ↓
INSERT outbox_events
   ↓
UPDATE idempotency_keys
   ↓
COMMIT
   ↓
DB Connection Released
   ↓
HTTP Response

Lock Scope:
idempotency_keys (row UPSERT lock)
orders (insert)
order_items (insert)
outbox_events (insert)

RISK
--------
None. Guarantees atomicity between order creation and event publishing. Prevents duplicate orders via idempotent locks within the same transaction.

RECOMMENDATION
--------
Maintain current boundary. Strong transactional outbox pattern.

CONFIDENCE
--------
High
Reason: Có source code trực tiếp chứng minh.
```

---

## Checkout Flow: Legacy Synchronous Inventory

### Findings

```text
FACT
--------
Legacy checkout flow locks inventory stock inside the order transaction.

EVIDENCE
--------
- File: apps/order-service/src/modules/checkout/repositories/checkout.repository.js
- Line: 228
- Snippet: `await client.query('BEGIN');`
- Line: 340
- Snippet: `await client.query('COMMIT');`

Transaction Boundary:
Checkout Request
   ↓
BEGIN
Isolation Level: NOT FOUND (Default PostgreSQL assumed)
   ↓
INSERT idempotency_keys
   ↓
SELECT inventory_stock FOR UPDATE
   ↓
UPDATE inventory_stock
   ↓
INSERT orders
   ↓
INSERT order_items
   ↓
UPDATE idempotency_keys
   ↓
COMMIT
   ↓
DB Connection Released
   ↓
HTTP Response

Lock Scope:
idempotency_keys (row UPSERT lock)
inventory_stock (row FOR UPDATE lock)
orders (insert)
order_items (insert)

RISK
--------
High risk of distributed deadlock and long-running transactions holding cross-domain locks. Bypasses proper domain boundaries.

RECOMMENDATION
--------
Replace this synchronous flow with the Async Saga flow. This transaction boundary must be split.

CONFIDENCE
--------
High
Reason: Có source code trực tiếp chứng minh.
```

---

## Payment Flow: Payment Request

### Findings

```text
FACT
--------
Payment creation and event emission share a transaction boundary.

EVIDENCE
--------
- File: apps/payment-service/src/infrastructure/payment.repository.js
- Line: 9
- Snippet: `await client.query('BEGIN');`
- Line: 36
- Snippet: `await client.query('COMMIT');`

Transaction Boundary:
RabbitMQ Message (Saga Worker Request)
   ↓
BEGIN
Isolation Level: NOT FOUND (Default PostgreSQL assumed)
   ↓
INSERT payments
   ↓
INSERT outbox_events (PaymentRequested)
   ↓
COMMIT
   ↓
DB Connection Released
   ↓
Ack RabbitMQ Message

Lock Scope:
payments (insert)
outbox_events (insert)

RISK
--------
None. Ensures no payment record is created without its corresponding event.

RECOMMENDATION
--------
Maintain current boundary. Valid outbox pattern.

CONFIDENCE
--------
High
Reason: Có source code trực tiếp chứng minh.
```

---

## Inventory Flow: Reservation Expiration

### Findings

```text
FACT
--------
Expiration worker uses SKIP LOCKED to process expired reservations safely.

EVIDENCE
--------
- File: apps/inventory-service/src/workers/expiration.worker.js
- Line: 11
- Snippet: `await client.query('BEGIN');`
- Line: 58
- Snippet: `await client.query('COMMIT');`

Transaction Boundary:
Cron Trigger
   ↓
BEGIN
Isolation Level: NOT FOUND (Default PostgreSQL assumed)
   ↓
SELECT inventory_reservations FOR UPDATE SKIP LOCKED
   ↓
UPDATE inventory_stock
   ↓
UPDATE inventory_reservations
   ↓
INSERT outbox_events
   ↓
COMMIT
   ↓
DB Connection Released
   ↓
End Job

Lock Scope:
inventory_reservations (row FOR UPDATE SKIP LOCKED)
inventory_stock (row update)
outbox_events (insert)

RISK
--------
None. Enables concurrent background workers to safely process expirations without locking contention.

RECOMMENDATION
--------
Maintain current boundary. Excellent concurrency control.

CONFIDENCE
--------
High
Reason: Có source code trực tiếp chứng minh.
```

---

## User Flow: Default Address Update

### Findings

```text
FACT
--------
Updating a default address resets the old default atomically.

EVIDENCE
--------
- File: apps/identity-service/src/modules/address/repositories/address.repository.js
- Line: 37
- Snippet: `await client.query('BEGIN');`
- Line: 44
- Snippet: `await client.query('COMMIT');`

Transaction Boundary:
HTTP Update Request
   ↓
BEGIN
Isolation Level: NOT FOUND (Default PostgreSQL assumed)
   ↓
UPDATE addresses SET is_default = false
   ↓
INSERT addresses (is_default = true)
   ↓
COMMIT
   ↓
DB Connection Released
   ↓
HTTP Response

Lock Scope:
addresses (row updates and inserts)

RISK
--------
None. Ensures a user never has two default addresses at the same time.

RECOMMENDATION
--------
Maintain current boundary.

CONFIDENCE
--------
High
Reason: Có source code trực tiếp chứng minh.
```
