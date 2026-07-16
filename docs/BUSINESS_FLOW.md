# Business Flow

## 1. Customer Flow
1. **Registration & Login:** Customer registers/logs in via Identity Service.
2. **Browsing:** Customer views restaurants and menus via Restaurant Service.
3. **Cart & Ordering:** Customer adds items to cart and submits order. Order is created in `PENDING` state.
4. **Payment:** Customer pays for the order via Payment Service.
5. **Tracking:** Customer tracks the order status (Pending -> Confirmed -> Preparing -> Delivering -> Delivered).

## 2. Merchant Flow
1. **Registration & Login:** Merchant logs in via Identity Service (with merchant role).
2. **Restaurant Management:** Merchant creates/updates restaurant details.
3. **Menu Management:** Merchant adds/updates menu items.
4. **Order Management:** Merchant views incoming orders and updates their status (Preparing, Ready for Pickup).

## 3. Driver Flow
(Currently out of scope / simplified. If implemented, driver would accept orders in 'Ready for Pickup' state and update to 'Delivering' and 'Delivered').

## 4. Admin Flow
1. **System Monitoring:** Admin monitors overall system health using Grafana dashboards.
2. **User Management:** Admin can manage users (future feature).

## 5. Order Lifecycle
- `PENDING`: Order created but inventory not yet reserved.
- `RESERVED`: Inventory reserved, awaiting payment.
- `CONFIRMED`: Payment successful.
- `PREPARING`: Merchant is preparing the order.
- `DELIVERING`: Driver picked up the order.
- `DELIVERED`: Order reached the customer.
- `CANCELLED`: Order was cancelled (by user or due to failed payment/inventory shortage).

## 6. Payment Lifecycle
- `PENDING`: Payment initiated.
- `SUCCESS`: Payment completed successfully.
- `FAILED`: Payment declined.

## 7. Inventory Lifecycle
- **Available:** Stock ready for purchase.
- **Reserved:** Stock temporarily held for a pending order.
- **Deducted:** Stock permanently reduced after successful payment.
- **Restored:** Stock added back if order/payment fails.

## 8. Saga Flow (Order Creation)
1. Order Service creates order (`PENDING`) -> Publishes `OrderCreatedEvent`.
2. Inventory Service consumes event -> Reserves stock -> Publishes `StockReservedEvent`.
   *(If out of stock -> Publishes `StockReservationFailedEvent` -> Order cancelled)*
3. Order Service consumes `StockReservedEvent` -> Status `RESERVED` -> Awaits payment.

## 9. Compensation Flow
- If payment fails, Order Service publishes `PaymentFailedEvent`.
- Inventory Service consumes it and restores the reserved stock.
- Order is marked as `CANCELLED`.
