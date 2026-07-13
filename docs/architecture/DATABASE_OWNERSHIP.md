# Database Ownership Matrix

## Overview
This document maps database tables to their respective owner services based on code evidence. 

All tables currently reside in a **Shared PostgreSQL Database** (Physical Storage). Ownership described below represents **Logical Ownership**. The long-term architectural goal is Database-per-service isolation.

### Access Pattern

| Table | Logical Owner | Allowed Writers | Forbidden Writers | Event Only |
| ----- | ------------- | --------------- | ----------------- | ---------- |
| `users` | Identity | Identity | All Others | - |
| `addresses` | Identity | Identity | All Others | - |
| `employees` | Identity | Identity | All Others | - |
| `orders` | Order | Order | All Others | - |
| `order_items` | Order | Order | All Others | - |
| `carts` | Order | Order | All Others | - |
| `cart_items` | Order | Order | All Others | - |
| `idempotency_keys` | Order | Order | All Others | - |
| `promotions` | Order | Order | All Others | - |
| `delivery` | Order | Order | All Others | - |
| `inventory_stock` | Inventory | Inventory | Order (VIOLATION) | - |
| `inventory_reservations` | Inventory | Inventory | All Others | - |
| `inventory_reservation_items` | Inventory | Inventory | All Others | - |
| `payments` | Payment | Payment | All Others | - |
| `webhook_inbox` | Payment | Payment | All Others | - |
| `mock_gateway_jobs` | Payment | Payment | All Others | - |
| `restaurants` | Restaurant | Restaurant | All Others | - |
| `categories` | Restaurant | Restaurant | All Others | - |
| `menu_items` | Restaurant | Restaurant | All Others | - |
| `food_search_projection` | Food | Food | All Others | - |

---

## Identity Service

### Tables Logically Owned
- `users`
- `addresses`
- `employees`

### Findings

```text
FACT
--------
Identity Service inserts into the users table.

EVIDENCE
--------
- File: apps/identity-service/src/modules/user/repositories/user.repository.js
- Line: 30
- Snippet: `INSERT INTO users (email, password, full_name, phone, address, role, is_active, merchant_status)`

Physical Storage: Shared PostgreSQL
Logical Ownership: Identity Service
Cross-service writes: No
Cross-service reads: No

RISK
--------
None. This is the expected behavior.

RECOMMENDATION
--------
Maintain current boundary.

CONFIDENCE
--------
High
Reason: Có source code trực tiếp chứng minh.
```

---

## Order Service

### Tables Logically Owned
- `orders`
- `order_items`
- `carts`
- `cart_items`
- `idempotency_keys`
- `promotions`
- `delivery`

### Findings

```text
FACT
--------
Order Service inserts into the delivery table via a nested repository.

EVIDENCE
--------
- File: apps/order-service/src/modules/delivery/repositories/delivery.repository.js
- Line: 5
- Snippet: `INSERT INTO delivery (id, order_id, status, created_at, updated_at)`

Physical Storage: Shared PostgreSQL
Logical Ownership: Order Service (Delivery Module)
Cross-service writes: No
Cross-service reads: No

RISK
--------
Delivery domain is currently coupled inside the Order domain, which could lead to scaling and ownership bottlenecks.

RECOMMENDATION
--------
Acceptable for MVP, but should eventually extract Delivery to a dedicated `delivery-service`.

CONFIDENCE
--------
High
Reason: Có source code trực tiếp chứng minh.
```

```text
FACT
--------
Order Service explicitly updates the `inventory_stock` table synchronously.

EVIDENCE
--------
- File: apps/order-service/src/modules/checkout/services/checkout.service.js
- Line: 58
- Snippet: `UPDATE inventory_stock SET reserved_quantity = reserved_quantity + $1`
- File: apps/order-service/src/modules/checkout/repositories/checkout.repository.js
- Line: 277
- Snippet: `UPDATE inventory_stock SET reserved_quantity = reserved_quantity + $1 ...`

Physical Storage: Shared PostgreSQL
Logical Ownership: Inventory Service
Cross-service writes: YES (Order Service writes to Inventory tables)
Cross-service reads: YES

RISK
--------
Current implementation bypasses Inventory Service boundary by directly modifying inventory-owned tables. This creates a synchronous coupling and high risk of distributed deadlock.

RECOMMENDATION
--------
Acceptable if permitted by an ADR for MVP (Shared DB), but constitutes severe architectural debt. Target for remediation in Sprint 3A by refactoring to Event-Driven Saga pattern.

CONFIDENCE
--------
High
Reason: Có source code trực tiếp chứng minh (cập nhật chéo domain).
```

---

## Inventory Service

### Tables Logically Owned
- `inventory_stock`
- `inventory_reservations`
- `inventory_reservation_items`

### Findings

```text
FACT
--------
Inventory Service inserts and updates stock and reservation tables.

EVIDENCE
--------
- File: apps/inventory-service/src/infrastructure/InventoryRepository.js
- Line: 47
- Snippet: `INSERT INTO inventory_reservations (order_id, status, expires_at)`

Physical Storage: Shared PostgreSQL
Logical Ownership: Inventory Service
Cross-service writes: No (Except Order Service violation noted above)
Cross-service reads: No

RISK
--------
None.

RECOMMENDATION
--------
Force Order Service to stop querying these tables directly.

CONFIDENCE
--------
High
Reason: Có source code trực tiếp chứng minh.
```

---

## Payment Service

### Tables Logically Owned
- `payments`
- `webhook_inbox`
- `mock_gateway_jobs`

### Findings

```text
FACT
--------
Payment Service inserts into payments and webhook_inbox tables.

EVIDENCE
--------
- File: apps/payment-service/src/infrastructure/payment.repository.js
- Line: 12
- Snippet: `INSERT INTO payments (...)`
- File: apps/payment-service/src/infrastructure/payment.repository.js
- Line: 126
- Snippet: `INSERT INTO webhook_inbox (event_id, provider, provider_event_id, signature, payload_hash, payload, traceparent)`

Physical Storage: Shared PostgreSQL
Logical Ownership: Payment Service
Cross-service writes: No
Cross-service reads: No

RISK
--------
None.

RECOMMENDATION
--------
Maintain current boundary.

CONFIDENCE
--------
High
Reason: Có source code trực tiếp chứng minh.
```

---

## Restaurant Service

### Tables Logically Owned
- `restaurants`
- `categories`
- `menu_items`

### Findings

```text
FACT
--------
Restaurant Service inserts into menu_items and categories tables.

EVIDENCE
--------
- File: apps/restaurant-service/src/modules/menu-item/repositories/menu-item.repository.js
- Line: 82
- Snippet: `INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, display_order, is_active)`

Physical Storage: Shared PostgreSQL
Logical Ownership: Restaurant Service
Cross-service writes: No
Cross-service reads: No

RISK
--------
None.

RECOMMENDATION
--------
Maintain current boundary.

CONFIDENCE
--------
High
Reason: Có source code trực tiếp chứng minh.
```

---

## Food Service

### Tables Logically Owned
- `food_search_projection`

### Findings

```text
FACT
--------
Food Service queries a read-model projection table.

EVIDENCE
--------
- File: apps/food-service/scripts/rebuild-food-projection.js
- Line: 16
- Snippet: `INSERT INTO food_search_projection (...)`
- File: apps/food-service/src/infrastructure/repositories/search.repository.js
- Line: 14
- Snippet: `SELECT * FROM food_search_projection`

Physical Storage: Shared PostgreSQL
Logical Ownership: Food Service
Cross-service writes: No
Cross-service reads: No

RISK
--------
Unclear if this service is actively maintained or deployed as part of the primary stack. Dead code risk.

RECOMMENDATION
--------
Investigate whether the rebuilding script is running automatically or if the API is exposed via Gateway.

CONFIDENCE
--------
Medium
Reason: Có nhiều evidence gián tiếp (code tồn tại, nhưng cấu hình chạy chưa rõ ràng).
```

---

## Shared Resources

### Physical Storage
- `outbox_events` (Shared PostgreSQL)

### Findings

```text
FACT
--------
outbox_events table is physically shared across multiple services, but logically isolated.

EVIDENCE
--------
- File: apps/inventory-service/src/infrastructure/InventoryRepository.js (Line 77)
- File: apps/order-service/src/modules/checkout/repositories/checkout.repository.js (Line 113)
- File: apps/payment-service/src/infrastructure/payment.repository.js (Line 159)
- Snippet: `INSERT INTO outbox_events (event_type, event_version, aggregate_type, aggregate_id, payload, metadata)`

Physical Storage: Shared PostgreSQL
Logical Ownership: Each service owns only its own rows (via `aggregate_type`).
Cross-service writes: No
Cross-service reads: No

RISK
--------
Multiple services write to the same physical table. This tightly couples all services to a single shared database instance for their outbox pattern.

RECOMMENDATION
--------
Acceptable for MVP. If the database is ever split (Database-per-service), each service MUST get its own `outbox_events` table (e.g., `order_outbox`, `payment_outbox`).

CONFIDENCE
--------
High
Reason: Có source code trực tiếp chứng minh (cả 3 service đều gọi trực tiếp vào bảng này).
```
