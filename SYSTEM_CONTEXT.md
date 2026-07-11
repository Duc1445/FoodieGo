# FoodieGo System Context

FoodieGo is an online food delivery platform built on a microservices architecture. It serves customers (ordering food), merchants (managing restaurants), and administrators.

## Core Actors
1. **Customer**: Browses restaurants, adds food to cart, places orders, and tracks delivery.
2. **Merchant (Restaurant Owner)**: Manages their restaurant info, menu items, and receives orders.
3. **Administrator**: Oversees the platform, manages users, and handles global configurations.

## High-Level Data Flow
1. Users interact with the **Frontend SPA** (`apps/web`).
2. Requests hit the **API Gateway** (`apps/gateway`) which acts as a reverse proxy.
3. The Gateway routes traffic to specific domain microservices:
   - `/api/v1/auth` -> **Identity Service**
   - `/api/v1/restaurants` -> **Restaurant Service**
   - `/api/v1/foods` -> **Food Service**
   - `/api/v1/orders` & `/api/v1/cart` -> **Order Service**
4. Services communicate asynchronously via **RabbitMQ** for cross-domain events (e.g., `OrderCreated` triggering payment/inventory checks).
5. Data is persisted in domain-specific databases (**PostgreSQL**) and caches (**Redis**).

## System Boundaries
- The Frontend is completely isolated from the backend databases. It only communicates via the API Gateway.
- Each microservice is responsible for its own bounded context and database. Direct cross-service database access is strictly forbidden.
