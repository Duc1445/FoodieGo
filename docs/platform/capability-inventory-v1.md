# Capability Specification: Inventory Foundation (v1)

**Status:** Proposed (Architecture Review Phase)
**Owner:** Platform Team
**Target Milestone:** v0.6

## 1. Business Capability Boundary

The Inventory Service is responsible for tracking and reserving stock for menu items. It strictly manages the lifecycle of stock and prevents overselling. 

**In Scope:**
* **Reserve Stock:** Temporarily hold stock for a user during the checkout/payment process.
* **Release Reservation:** Free up reserved stock if payment fails or order is cancelled.
* **Confirm Deduction:** Permanently deduct stock when payment succeeds.
* **Expiration Policy:** Automatically release reserved stock if it is not confirmed within a defined TTL (Time-To-Live, e.g., 15 minutes).

**Out of Scope:**
* Pricing and catalog management (handled by Restaurant Service).
* Payment processing (handled by Payment Service).
* General cart aggregation (handled by Order Service).

## 2. Architecture

### 2.1 Service Boundaries
- **Inventory Service:** A standalone microservice with its own database (`inventory_db`). 
- It maintains the source of truth for `Stock` and `Reservations`.

### 2.2 Data Model
* **Stock Table (Ledger-style):** 
  - `item_id`, `total_quantity`, `reserved_quantity`, `available_quantity` (virtual), `version` (for optimistic locking).
* **Reservation Table:**
  - `reservation_id` (usually maps to `order_id`), `item_id`, `quantity`, `status` (`PENDING`, `CONFIRMED`, `RELEASED`), `expires_at`.

### 2.3 Event Flow
The Inventory Service communicates entirely asynchronously via RabbitMQ (Inbox/Outbox pattern).
```
Order Service               RabbitMQ                 Inventory Service
      |                        |                             |
      |--- OrderCreated ------>|                             |
      |                        |--- OrderCreated ----------->|
      |                        |                             | (Reserves Stock)
      |                        |<-- InventoryReserved -------|
      |<-- InventoryReserved --|                             |
```

## 3. Consistency Guarantee

* **Optimistic Locking:** The `Stock` table uses a `version` column to prevent lost updates during concurrent reservation requests.
* **Idempotency:** Every incoming event (`OrderCreated`, `PaymentFailed`) is processed through an Inbox pattern. The `event_id` or `order_id` guarantees exactly-once processing. If an `OrderCreated` event is received twice, the second attempt will be ignored.
* **Database Transactions:** Creating a `Reservation` record and updating the `Stock` table will always occur in a single ACID transaction within PostgreSQL.

## 4. Failure Scenarios & Mitigation

* **Reservation Timeout:** A Cron Job or TTL-based mechanism (e.g., Redis Expiration or background worker) continuously scans for `Reservations` where `expires_at < NOW()` and `status = PENDING`. It will automatically revert the reserved quantity back to available stock.
* **Duplicate Events:** Mitigated via Inbox pattern deduplication.
* **Order Cancelled / Payment Failed:** The Inventory Service listens for `OrderCancelled` or `PaymentFailed` events and will trigger the "Release Reservation" capability.
* **Consumer Crash:** If the Inventory Service crashes mid-processing, RabbitMQ will redeliver the message (since `ack` is only sent after the Inbox transaction commits).

## 5. Evidence Plan (Release Criteria)

To promote this capability to Beta, the following runtime evidence must be provided:
* **ADR:** Publish ADR-006 for the Inventory Reservation Strategy (Saga/Choreography).
* **Concurrency Tests:** k6 load tests hitting the same `item_id` simultaneously to prove that optimistic locking successfully prevents overselling.
* **Chaos Scenarios:** Kill the Inventory Service consumer during a burst of `OrderCreated` events and verify that 0 messages are lost.
* **Distributed Tracing:** Tempo traces showing `OrderCreated -> InventoryReserved` as a single correlated trace.
