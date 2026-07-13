# Architecture Risk Register

## Overview
This document tracks all identified architectural risks, technical debt, and DDD violations across the FoodieGo microservices. 
It serves as the primary tracking board for the Principal Architect to decide which issues must be fixed before or during Sprint 3A.

---

| ID    | Risk                                                              | Likelihood | Impact   | Severity | Category         | Decision | Owner   | Target Sprint |
| ----- | ----------------------------------------------------------------- | ---------- | -------- | -------- | ---------------- | -------- | ------- | ------------- |
| AR-01 | Order Service directly updates `inventory_stock` synchronously    | High       | Critical | High     | DDD Violation    | Mitigate | Order   | Sprint 3A     |
| AR-02 | Delivery module is tightly coupled inside Order Service           | Low        | Medium   | Low      | Bounded Context  | Accept   | Order   | Future        |
| AR-03 | Shared `outbox_events` table across multiple services             | High       | Medium   | Medium   | DB Isolation     | Accept   | Infra   | Future        |
| AR-04 | `food-service` uses `food_search_projection` but may be dead code | Medium     | Low      | Low      | Dead Code        | Mitigate | Search  | Sprint 3B     |
| AR-05 | Integration events lack JSON Schemas and Consumer Contract Tests  | High       | High     | High     | Eventing         | Mitigate | Plat    | Sprint 3A     |

---

## Detailed Risks

### AR-01: Order Service directly updates `inventory_stock` synchronously
- **Description:** Checkout flow executes an `UPDATE inventory_stock` SQL command directly from the Order Service, bypassing the Inventory Service domain boundary.
- **Impact:** Critical. Prevents the ability to split the database physically per service. Introduces cross-domain locking and distributed deadlock risks.
- **Detection:** `grep "inventory_stock" apps/order-service/src/**/*.js` must return 0 results.
- **Exit Criteria:** 
  - 100% of inventory updates moved to `inventory-service`.
  - Saga state machine orchestrates checkout via `OrderPendingReservation` events.

### AR-02: Delivery module is tightly coupled inside Order Service
- **Description:** Delivery-related repositories and services are located under `apps/order-service/src/modules/delivery`, functioning as a modular monolith rather than an independent service.
- **Impact:** Medium. Order Service becomes a bottleneck for delivery-related scaling and deployment.
- **Detection:** Check if `apps/order-service/src/modules/delivery` exists.
- **Exit Criteria:** N/A (Accepted for MVP)

### AR-03: Shared `outbox_events` table across multiple services
- **Description:** Order, Payment, and other services all insert into a single `outbox_events` table.
- **Impact:** Medium. The current setup technically violates the "local outbox table per service" rule, meaning services are still coupled at the database level.
- **Detection:** Check if `INSERT INTO outbox_events` is used across multiple service domains.
- **Exit Criteria:** N/A (Accepted for MVP)

### AR-04: `food-service` uses `food_search_projection` but may be dead code
- **Description:** Code exists for a CQRS read-model, but there is no clear evidence it is actively being executed or requested by the API Gateway.
- **Impact:** Maintenance overhead.
- **Detection:** Monitor API Gateway metrics/logs for routes routing to `food-service`.
- **Exit Criteria:** 
  - Audit API Gateway logs for 7 days.
  - Delete `food-service` app folder if unused.

### AR-05: Integration events lack JSON Schemas and Consumer Contract Tests
- **Description:** Integration events (like `OrderPendingReservation`) do not have strict JSON Schemas defined in `packages/contracts/events`. There are no Consumer-Driven Contract (CDC) tests to guarantee backward compatibility.
- **Impact:** High risk of breaking changes across bounded contexts. If Order Service alters an event schema, Inventory Service may crash at runtime.
- **Detection:** `npm run test:contracts` runs and reports 0 schema violations.
- **Exit Criteria:**
  - 5/5 Saga integration events have versioned JSON schemas in `packages/contracts/events`.
  - 100% of integration events covered by Jest validation tests simulating Provider-Consumer boundaries.
