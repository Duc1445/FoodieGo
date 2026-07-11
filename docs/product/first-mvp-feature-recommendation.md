# First MVP Feature Recommendation

## 1. Feature Recommendation
**Sprint 2C: Order Tracking & History**

## 2. Why this feature?
- **Dependency Complexity**: It naturally follows the successful execution of the Checkout Flow (Sprint 2B). We now have orders in the database, but no way for the customer to track them.
- **Business Value**: The "Customer" persona's primary pain point is "unknown order status". Providing real-time or polling-based order tracking solves this immediately.
- **Architecture Validation Value**: Implementing order status updates requires testing the CQRS/Event-driven bridge between the `restaurant-service` (accepting an order) and the `order-service` (updating the status for the customer). It perfectly tests our newly formalized RabbitMQ Event Recovery Strategy (ADR-0008).

## 3. Scope
- **Backend**: GET `/orders/history`, GET `/orders/:id/status`.
- **Frontend**: MyOrdersPage, OrderDetailPage with status timeline.
- **Event Bus**: Restaurant accepts/rejects order -> Order status updated.
