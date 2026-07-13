# Saga Failure Matrix (Reference)

This document is the **Single Source of Truth** for the entire Commutative Order Saga. All microservices MUST adhere to this behavior for incoming events and compensating actions. 

## Saga Behavior Matrix

| Incoming Event | Current Order State | Internal Action | Emitted Compensations |
| :--- | :--- | :--- | :--- |
| `PaymentAuthorized` | `PENDING` | `is_payment_authorized = true` | *Maybe* `OrderConfirmed` (if inventory reserved) |
| `InventoryReserved` | `PENDING` | `is_inventory_reserved = true` | *Maybe* `OrderConfirmed` (if payment authorized) |
| `PaymentFailed` | `PENDING` | Set `status = CANCELLED`, `is_cancelled = true` | `ReleaseInventoryCommand` (if `is_inventory_reserved`) + `OrderCancelled` |
| `InventoryFailed` / `InventoryExpired` | `PENDING` | Set `status = CANCELLED`, `is_cancelled = true` | `RefundPaymentCommand` (if `is_payment_authorized`) + `OrderCancelled` |
| Timeout (`SYSTEM_TIMEOUT`) | `PENDING` | Set `status = CANCELLED`, `is_cancelled = true` | `RefundPaymentCommand` (if `is_payment_authorized`) + `ReleaseInventoryCommand` (if `is_inventory_reserved`) + `OrderCancelled` |
| `InventoryReserved` *(Late Arrival)* | `CANCELLED` | `is_inventory_reserved = true` | `ReleaseInventoryCommand` |
| `PaymentAuthorized` *(Late Arrival)* | `CANCELLED` | `is_payment_authorized = true` | `RefundPaymentCommand` |

## Core Principles

1. **Atomic State Transitions**: An Order only transitions from `PENDING` to `CONFIRMED` when both `is_payment_authorized` and `is_inventory_reserved` are strictly evaluated together via an atomic `UPDATE ... WHERE ... status = 'PENDING'` clause.
2. **Business Idempotency**: Consumers update business flags (`is_payment_authorized = true`) idempotently, independently of message duplication. 
3. **Commutativity**: The Saga Evaluator does not enforce the order of `PaymentAuthorized` and `InventoryReserved`. Whichever event arrives second executes the state transition to `CONFIRMED`.
4. **Late Arrivals**: If an order is already `CANCELLED` (e.g. by the Timeout Worker or a failure from another service), and a delayed success event arrives, the Order Service **MUST immediately** emit the corresponding compensation command for that service.
