# Aggregate Roots & Entities

Each microservice is responsible for specific database tables. An Aggregate Root is the primary entity that controls access to its children.

## `identity-service`
*   **`User` (Aggregate Root)**
    *   `Role` (Value Object/Enum)
    *   `Session` (Entity)

## `restaurant-service`
*   **`Restaurant` (Aggregate Root)**
    *   `Category` (Entity)
    *   `MenuItem` (Entity)
    *   `OperatingHours` (Value Object)
*   **`KitchenQueue` (Aggregate Root)**
    *   `Ticket` (Entity)

## `order-service`
*   **`Cart` (Aggregate Root)**
    *   `CartItem` (Entity)
*   **`Order` (Aggregate Root)**
    *   `OrderItem` (Entity)
    *   `DeliveryAddress` (Value Object)

## `payment-service`
*   **`Payment` (Aggregate Root)**
    *   `PaymentAttempt` (Entity)
*   **`Refund` (Aggregate Root)**

## `inventory-service`
*   **`Stock` (Aggregate Root)**
    *   `Reservation` (Entity)

## `driver-service` (Future)
*   **`Driver` (Aggregate Root)**
    *   `Vehicle` (Entity)
    *   `Wallet` (Entity)
*   **`DeliveryJob` (Aggregate Root)**
    *   `TrackingLog` (Entity)
