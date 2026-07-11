# FoodieGo Database & Storage Strategy

Each microservice in FoodieGo encapsulates its own data store. Services are prohibited from directly accessing each other's databases.

## 1. Relational Storage (PostgreSQL)
Most microservices use PostgreSQL as their primary data store.
- **Identity Service**: `users` (credentials, roles, basic profile info).
- **Restaurant Service**: `restaurants`, `categories`, `menu_items`. (Serves static catalog data).
- **Food Service**: `food_items`, `food_projections` (Optimized for fast read/search queries).
- **Order Service**: `orders`, `order_items`, `checkout_sessions`.
- **Inventory Service**: `inventory`, `reservations`.

## 2. In-Memory Caching & Ephemeral Data (Redis)
- **Identity Service**: Session storage and token blacklisting.
- **Order Service (Cart)**: The shopping cart is stored entirely in Redis (e.g., using Hash maps `cart:{userId}`). This ensures low latency and high availability.
- **Gateway / General**: Rate limiting and shared temporary state.

## 3. Optimistic Locking & Idempotency
- **Cart Syncing**: `order-service` stores a `version` alongside the cart in Redis. This version increments on every mutation. Checkout requires matching this version to prevent stale data updates.
- **Idempotency**: Clients must send an `Idempotency-Key` when initiating state-mutating events like `/checkout`. Redis tracks the status of these keys to prevent duplicate transactions if network retries occur.

## 4. Message Broker (RabbitMQ)
- Asynchronous events (e.g., `OrderCreated`, `PaymentSuccessful`, `InventoryReserved`) are routed via RabbitMQ to ensure eventual consistency across microservice boundaries.
