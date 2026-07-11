# FoodieGo Architecture

FoodieGo uses a Monorepo structure managed by `pnpm` workspaces, integrating a React Frontend with a Node.js Microservices Backend.

## 1. Frontend (`apps/web`)
- **Framework**: React 18, Vite, TypeScript.
- **State Management**: Zustand (Local State & Auth), React Query (Server State for complex data fetching).
- **Styling**: TailwindCSS, Radix UI.
- **Architecture**:
  - `src/shared`: Core utilities, shared components, constants, types, API wrappers, and stores.
  - `src/customer`: Pages and layouts for the end-user (Customer Portal).
  - `src/merchant` & `src/admin`: (Future scope) Portals for other actors.
- **API Interception**: Axios interceptors automatically attach `Authorization` (JWT) and `X-User-Id` headers.

## 2. Shared Packages (`packages/*`)
- `packages/ui`: A shared design system built on Radix UI and TailwindCSS, enforcing consistency and accessibility.
- `packages/eslint-config` & `packages/typescript-config`: Centralized linting and compiler rules.

## 3. Backend Microservices
All services are containerized and orchestrated via Docker Compose.
- **Gateway (`apps/gateway`)**: An Nginx/Node.js reverse proxy that routes traffic based on URL paths. It does not handle business logic or JWT verification (it only passes headers).
- **Identity Service (`apps/identity-service`)**: Handles authentication, user registration, and issues JWTs.
- **Restaurant Service (`apps/restaurant-service`)**: Manages restaurant profiles, menus, and categories. Serves static/referential catalog data.
- **Food Service (`apps/food-service`)**: Employs **CQRS** (Command Query Responsibility Segregation) and **Event Sourcing** for high-performance querying of food items and availability.
- **Order Service (`apps/order-service`)**: Manages the shopping cart (Redis) and order lifecycle (PostgreSQL). Employs Optimistic Locking and Idempotency keys to ensure transaction safety.
- **Inventory Service (`apps/inventory-service`)**: Tracks physical stock/availability of items.
- **Payment Service (`apps/payment-service`)**: Integrates with third-party payment gateways.

## 4. Infrastructure & Observability
- **Message Broker**: RabbitMQ for async event publishing (e.g., `OrderCreated`).
- **Telemetry**: Prometheus, Grafana, Loki, Promtail, Tempo for logging, tracing, and metrics.
