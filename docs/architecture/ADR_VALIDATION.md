# ADR Validation Report

## Overview
This document evaluates the compliance of the current codebase against the approved Architectural Decision Records (ADRs). Each ADR is assessed as PASS, PARTIAL, or FAIL based strictly on code evidence.

---

## 0002. Microservices architecture decision

### Validation: PASS

```text
Reason
--------
The repository is split into independent microservice applications under `apps/`.

Evidence
--------
- Path: `apps/`
- Contains: `identity-service`, `order-service`, `inventory-service`, `payment-service`, `restaurant-service`, `food-service`

Deviation
--------
None. The modular architecture aligns with the microservices decision.

Impact
--------
None.

Exit Criteria
--------
N/A
```

---

## 0004. Database ownership per service

### Validation: FAIL

```text
Reason
--------
Order Service violates database ownership by directly locking and updating the `inventory_stock` table.

Evidence
--------
- File: apps/order-service/src/modules/checkout/repositories/checkout.repository.js
- Line: 277
- Snippet: `UPDATE inventory_stock SET reserved_quantity = reserved_quantity + $1`

Deviation
--------
Direct database access from another service is strictly forbidden by ADR 0004, yet Order Service directly updates Inventory's table. All tables also share the exact same physical PostgreSQL database.

Impact
--------
Impossible to split physical database instances. High risk of distributed deadlock.

Exit Criteria
--------
Remove `UPDATE inventory_stock` from Order Service and replace with API/Event calls.
```

---

## 009. Inventory Reservation & Saga Flow

### Validation: FAIL

```text
Reason
--------
Checkout flow synchronously executes inventory reservation inside a single transaction instead of using the approved Async Saga.

Evidence
--------
- File: apps/order-service/src/modules/checkout/repositories/checkout.repository.js
- Line: 228
- Snippet: `await client.query('BEGIN'); ... SELECT inventory_stock FOR UPDATE ... INSERT orders ... await client.query('COMMIT');`

Deviation
--------
ADR 009 mandates a Choreography-based Saga using `OrderPendingReservation` and `InventoryReserved` events. The current implementation bypasses this entirely using synchronous SQL locks.

Impact
--------
Fails to meet the "No oversell under concurrency" requirement if load scales. Blocks the completion of Sprint 3A.

Exit Criteria
--------
Implement Saga state machine for `RESERVED`, `CONFIRMED`, `RELEASED`.
```

---

## ADR-002. Strict Outbox Pattern Implementation

### Validation: PARTIAL

```text
Reason
--------
Event publishing utilizes an outbox pattern, but multiple services write to the same physical `outbox_events` table.

Evidence
--------
- File: apps/order-service/src/modules/checkout/repositories/checkout.repository.js
- Line: 113
- Snippet: `INSERT INTO outbox_events (event_type, event_version, aggregate_type, aggregate_id, payload, metadata)`
- File: apps/payment-service/src/infrastructure/payment.repository.js
- Line: 159
- Snippet: `INSERT INTO outbox_events (...)`

Deviation
--------
While the local outbox pattern is implemented (no dual writes to RabbitMQ), the table itself is globally shared across domains, violating the "local outbox table" assumption.

Impact
--------
Prevents true separation of services at the database level.

Exit Criteria
--------
Migrate `outbox_events` to service-specific tables (e.g. `order_outbox`).
```

---

## ADR-002: Why Layered DDD (Hybrid)

### Validation: PARTIAL

```text
Reason
--------
Most services follow the `Controller -> Service -> Repository` structure, but bounded contexts are occasionally merged in a monolithic way (e.g., Delivery inside Order).

Evidence
--------
- File: apps/order-service/src/modules/delivery/repositories/delivery.repository.js
- Snippet: Delivery module exists inside `order-service` instead of being its own bounded context or service.

Deviation
--------
The layered structure is respected at the folder level, but the logical DDD boundaries are blurred within the `order-service`.

Impact
--------
Order Service takes on too many responsibilities.

Exit Criteria
--------
Re-evaluate Delivery extraction after MVP.
```
