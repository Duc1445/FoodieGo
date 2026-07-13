# Event Naming Conventions

## Overview
Consistent event naming allows developers to immediately understand an event's origin, its intent, and its timing relative to the state change. FoodieGo uses a strict **PascalCase** naming convention for all integration events.

---

## 1. Naming Structure

The name of an event MUST follow the pattern:
`[Aggregate][Action/StateChange][Status]`

### 1.1. Aggregate
The primary domain entity that the event belongs to.
- `Order`
- `Inventory`
- `Payment`
- `User`

### 1.2. Action / State Change
A verb describing what happened. **Must always be in the past tense** unless it denotes an explicit pending request.
- `Created`
- `Updated`
- `Cancelled`
- `Reserved`
- `Refunded`

### 1.3. Status (Optional, mostly for Sagas)
When a process is asynchronous and involves a saga, explicit status suffixes indicate intent.
- `PendingReservation` (Indicates the order was created, but is waiting on Inventory)
- `Failed` (Indicates a failure state)

---

## 2. Examples

### Good Naming ✅
- `OrderCreated`: A new order was successfully created in the database.
- `OrderPendingReservation`: The order state machine has transitioned to a state where it requires an inventory reservation.
- `InventoryReserved`: The inventory was successfully locked for an order.
- `InventoryReservationFailed`: The inventory could not be locked (e.g. out of stock).
- `PaymentCompleted`: The payment gateway successfully charged the card.

### Bad Naming ❌
- `CreateOrder`: (Bad - sounds like an RPC command, not a past-tense event).
- `inventory-reserved`: (Bad - must be PascalCase).
- `OrderUpdatedWithInventoryStatus`: (Bad - overly verbose and leaks implementation details).

---

## 3. RabbitMQ Routing Keys

While event `type` names are PascalCase, the AMQP **Routing Keys** used in RabbitMQ follow a `dot.separated.lowercase` convention to allow wildcard bindings (`*` and `#`).

**Format:**
`[domain].[aggregate].[event_type_kebab]`

**Examples:**
- `OrderCreated` → `order.orders.order-created`
- `InventoryReserved` → `inventory.stock.inventory-reserved`
- `PaymentFailed` → `payment.transactions.payment-failed`
