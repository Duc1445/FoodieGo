# Event Governance Matrix

## Overview
This document tracks all asynchronous integration events across the FoodieGo microservices architecture. It evaluates the maturity of event governance, focusing on ownership, schemas, backward compatibility, and error handling.

---

## 1. Checkout Saga Events (Target: Sprint 3A)

### `OrderPendingReservation`
- **Owner (Producer):** Order Service
- **Consumer:** Inventory Service
- **Contract Owner:** Platform Architecture
- **Source of Truth:** Order Aggregate (DB state)
- **Version:** v1
- **Evolution Policy:** Backward Compatible. New fields must be optional. Do not rename existing fields.
- **Schema:** NOT FOUND (Missing JSON schema contract)
- **Contract Test:** NOT FOUND (No automated contract validation)

**Resilience & Error Handling**
- **Idempotency:** NOT FOUND (No inbox usage found in Inventory Service for this event)
- **Retry:** NOT FOUND (RabbitMQ deadLetterExchange/retry configurations not found in codebase)
- **DLQ:** NOT FOUND
- **Compensation (Planned):** If Inventory fails, publishes `InventoryReservationFailed` back to Order.

### `InventoryReserved`
- **Owner (Producer):** Inventory Service
- **Consumer:** Order Service
- **Contract Owner:** Platform Architecture
- **Source of Truth:** Inventory DB (Reservations)
- **Version:** v1
- **Evolution Policy:** Forward Compatible
- **Schema:** NOT FOUND
- **Contract Test:** NOT FOUND

**Resilience & Error Handling**
- **Idempotency:** NOT FOUND
- **Retry:** NOT FOUND
- **DLQ:** NOT FOUND
- **Compensation (Planned):** None needed, triggers `PaymentRequested`.

### `InventoryReservationFailed`
- **Owner (Producer):** Inventory Service
- **Consumer:** Order Service
- **Contract Owner:** Platform Architecture
- **Source of Truth:** Inventory DB
- **Version:** v1
- **Evolution Policy:** Backward Compatible
- **Schema:** NOT FOUND
- **Contract Test:** NOT FOUND

**Resilience & Error Handling**
- **Idempotency:** NOT FOUND
- **Retry:** NOT FOUND
- **DLQ:** NOT FOUND
- **Compensation (Planned):** Order Service transitions order state to `FAILED` and notifies user.

---

## 2. Payment Saga Events

### `PaymentRequested`
- **Owner (Producer):** Order Service
- **Consumer:** Payment Service
- **Contract Owner:** Platform Architecture
- **Source of Truth:** Order Aggregate
- **Version:** v1
- **Evolution Policy:** Backward Compatible
- **Schema:** NOT FOUND
- **Contract Test:** NOT FOUND

**Resilience & Error Handling**
- **Idempotency:** Implemented via `webhook_inbox` / `inbox_messages` table.
- **Retry:** NOT FOUND
- **DLQ:** NOT FOUND
- **Compensation (Planned):** If payment provider fails, emits `PaymentFailed`.

### `PaymentCompleted` / `PaymentFailed`
- **Owner (Producer):** Payment Service
- **Consumer:** Order Service, Inventory Service
- **Contract Owner:** Platform Architecture
- **Source of Truth:** Stripe/VNPay Webhook
- **Version:** v1
- **Evolution Policy:** Backward Compatible
- **Schema:** NOT FOUND
- **Contract Test:** NOT FOUND

**Resilience & Error Handling**
- **Idempotency:** NOT FOUND
- **Retry:** NOT FOUND
- **DLQ:** NOT FOUND
- **Compensation (Planned):** Order moves to `CONFIRMED` or `CANCELLED`. Inventory permanently deducts or releases.

---

## 3. Order Lifecycle Events

### `OrderCancelled`
- **Owner (Producer):** Order Service
- **Consumer:** Payment Service, Inventory Service
- **Contract Owner:** Platform Architecture
- **Source of Truth:** Order Aggregate
- **Version:** v1
- **Evolution Policy:** Backward Compatible
- **Schema:** NOT FOUND
- **Contract Test:** NOT FOUND

**Resilience & Error Handling**
- **Idempotency:** NOT FOUND
- **Retry:** NOT FOUND
- **DLQ:** NOT FOUND
- **Compensation (Planned):** Payment Service attempts refund via `PaymentRefunded`.

---

## 4. Cart Events (Domain / Internal)

*Note: These are currently internal domain events but are published via an event publisher interface.*

### `ItemAddedToCart`, `CartItemQuantityUpdated`, `CartCleared`, `ItemRemovedFromCart`
- **Owner (Producer):** Order Service (Cart Module)
- **Consumer:** Order Service (Internal)
- **Contract Owner:** Order Domain
- **Source of Truth:** Redis/Cart In-Memory
- **Version:** Internal
- **Evolution Policy:** Internal only.
- **Schema:** N/A (In-memory Object)
- **Contract Test:** N/A

---

## 5. Failure Matrix

This matrix defines the standard operational response to different types of asynchronous failures within the Event-Driven architecture.

| Failure Condition | Retry Strategy | DLQ | Compensation | Alerting |
| ----------------- | -------------- | --- | ------------ | -------- |
| **Inventory DB Timeout** | Linear Retry (x3) | Route to `foodiego.inventory.dlq` | Publish `InventoryReservationFailed` after max retries | Critical Alert to Operations |
| **Outbox Publish Failure** | Exponential Backoff | Leave in `outbox_events` table for manual replay | None (Source of truth is intact) | Warning Alert to Infra |
| **Payment Webhook Timeout** | Rely on Stripe/VNPay built-in retries | N/A (Handled by Provider) | Transition Order to `CANCELLED` if missing after 24h | Warning Alert to Finance |
| **Malformed Schema (AJV)** | Immediate Reject (No Retry) | Route to `foodiego.system.dlq` | None | Critical Alert to Architecture |

---

## Conclusion & Architecture Gate Assessment

### Findings
```text
FACT
--------
Integration events lack formal JSON schemas and automated contract testing.

EVIDENCE
--------
- Path: `packages/contracts/events/` is empty or missing schemas for core Saga events.
- No test files matching `*.spec.ts` or `*.test.ts` for event schema validation.

RISK
--------
High risk of schema drift. If Order Service adds a required field to `OrderPendingReservation`, Inventory Service will break at runtime. This violates robust distributed system principles.

RECOMMENDATION
--------
Adopt a Schema Registry or strict JSON Schema definitions in `packages/contracts/events/`. Enforce Consumer-Driven Contract (CDC) testing (e.g., using Pact) before Sprint 3A concludes.

CONFIDENCE
--------
High
Reason: Source code check reveals no schemas or CDC tests.
```
