# ADR 009: Inventory Reservation & Saga Flow

**Status:** Approved
**Date:** 2026-07-05
**Context:** FoodieGo E-commerce Core

## Context and Problem Statement
To prevent overselling and maintain a consistent checkout process, we must transition from a monolithic checkout approach to a distributed saga. When a user places an order, we must reserve inventory before accepting payment. If payment fails or times out, the reserved inventory must be reliably released back to the available pool.

## Decision

We will implement a **Choreography-based Saga** for the Checkout flow, centered around the Inventory Reservation capability.

### 1. Saga Ownership
- **Saga Orchestrator**: `Order Service`. It manages the state machine of the order and emits business events to drive the process.
- **Saga Participants**: `Inventory Service`, `Payment Service`, `Notification Service`. They react to events, execute local transactions, and publish results.

### 2. Reservation Lifecycle & State Machine
The `Reservation` aggregate inside the Inventory Service will have its own strictly defined state machine:
- `CREATED`: Initial state upon receiving an order.
- `RESERVED`: Stock has been successfully deducted from `available_quantity` and added to `reserved_quantity`.
- `CONFIRMED`: Payment succeeded. The `reserved_quantity` is permanently deducted.
- `EXPIRED`: The TTL has been reached without payment confirmation.
- `RELEASED`: The `reserved_quantity` is restored to `available_quantity`.

*(Note: There is no `CONFIRMING` state to keep the business logic clean. Payment processing state is handled by the Order Service's `PAYMENT_PROCESSING` state).*

### 3. Event Contracts
Events will be versioned starting at `v1`. The payload relies on `sku` (not `menuItemId`) and removes platform policies (like TTL) from the payload.

- **`OrderPendingReservation` (v1)**
  - Source: Order Service
  - Payload: `{ orderId, items: [{ sku, quantity }], traceId }`
- **`InventoryReserved` (v1)**
  - Source: Inventory Service
  - Payload: `{ orderId, reservationId, status: 'RESERVED', expiresAt }`
- **`InventoryReservationFailed` (v1)**
  - Source: Inventory Service
  - Payload: `{ orderId, reason, failedSkus }`
- **`PaymentCompleted` / `PaymentFailed` (v1)**
  - Source: Payment Service (Future Sprint)
- **`InventoryReleased` (v1)**
  - Source: Inventory Service
  - Payload: `{ orderId, reservationId, reason }`

### 4. Compensation Matrix

| Failure Condition | Orchestrator / Participant Action |
| :--- | :--- |
| **Inventory Reserve Fail** | Order Service consumes `InventoryReservationFailed` and cancels Order. |
| **Payment Fail** | Inventory consumes `PaymentFailed` and releases Reservation. |
| **Inventory Release Fail** | Inventory Outbox/Inbox mechanism automatically retries. |
| **Payment Timeout** | Order Service times out or Inventory TTL worker expires Reservation. |
| **Duplicate Event** | Inbox pattern silently ignores the duplicate. |

### 5. Compensation & Expiration (TTL)
- **TTL Configuration**: The Inventory Service reads `process.env.RESERVATION_TTL` internally.
- **Worker Policy**: A background worker uses `SELECT ... FOR UPDATE SKIP LOCKED` to safely scan and expire reservations in a concurrent, multi-instance environment without deadlocks.

### 6. Idempotency and Consistency
- **Exactly-Once Processing**: All services use the Inbox Pattern.
- **Optimistic Locking**: The Inventory Service uses a `version` column on the `Stock` table. Domain objects expose `availableQuantity()`, `reservedQuantity()`, and `totalQuantity()`.

## Exit Criteria (Definition of Done)
Capability Inventory is promoted to Beta only when:
- [ ] No oversell under concurrency (e.g., k6 with 500 VUs).
- [ ] Reservation expiration and TTL worker functions correctly.
- [ ] Event replay and duplicate Inbox deduplication work flawlessly.
- [ ] Distributed trace completes successfully from Gateway to Consumer.
- [ ] All custom metrics (`inventory_reservation_latency`, `inventory_conflict_total`, etc.) are exported and Grafana alerts are functional.

## Consequences
- **Positive:** Robust, production-grade Saga implementation. Decoupled services (SKU boundary). Scalable TTL expiration.
- **Negative:** Increased complexity in tracing the state of an order (partially mitigated by Observability/Tempo). Eventual consistency means the client must poll or rely on WebSockets to know when the order is `READY_FOR_PAYMENT`.
