# ADR 004: Inventory Reservation Strategy

## Status
Accepted

## Context
In a food delivery platform, preventing overselling (users ordering items that are no longer available) is critical. However, strict distributed locking on inventory at the exact moment of adding to cart can degrade performance and lead to "abandoned carts" locking up stock.

As we build the Checkout Slice (Sprint B1.3), we need to define how and when inventory is reserved to balance performance, consistency, and business needs.

## Decision
We will adopt a phased approach to inventory reservation:

### Phase 1: Validation Only (Current - Sprint B1.3)
- **Mechanism**: No explicit reservation. We only validate `is_available` from the Restaurant Service during `AddToCart` and `Checkout`.
- **Pros**: Simplest to implement, high performance.
- **Cons**: Race conditions can lead to overselling if two users check out the last item simultaneously. Acceptable for MVP.

### Phase 2: Soft Reservation (Future)
- **Mechanism**: Implement a short-lived Soft Reservation (e.g., 5 minutes) via Redis when the user enters the Checkout screen.
- **Data Model**: Track `available_stock` and `reserved_stock` in Restaurant Service.
- **Flow**: Checkout -> Call Restaurant Service to reserve -> Proceed to Payment -> Confirm or Expire.
- **Pros**: Reduces overselling significantly, auto-expires abandoned carts.
- **Cons**: Requires distributed orchestration between Order Service and Restaurant Service.

### Phase 3: Distributed Inventory with Saga (Long-Term)
- **Mechanism**: Dedicated Inventory Service or advanced Saga Orchestrator. 
- **Flow**: Order CREATED -> Saga -> Reserve Inventory -> Process Payment -> Confirm Order.
- **Pros**: Strict consistency, enterprise-grade.
- **Cons**: High complexity, requires message brokers and Saga management.

## Consequences
- For B1.3, we accept the minor risk of overselling (handled via manual cancellation/refund if it happens).
- The Restaurant Service API contract currently only exposes `is_available`, which aligns with Phase 1. When we move to Phase 2, the API will be updated to handle `POST /api/v1/inventory/reserve`.
