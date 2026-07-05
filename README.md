# FoodieGo 🍲

FoodieGo is a modern, microservices-based application built with Node.js, Express, PostgreSQL, and Redis, designed using a Layered Domain-Driven Design (DDD) architecture.

## Architecture & Structure 🏗️
- **Monorepo (pnpm workspaces)**
  - `apps/`: Core microservices (`identity-service`, `restaurant-service`, `order-service`, `gateway`).
  - `packages/`: Shared infrastructure packages (`logger`, `config`, `database`, `utils`, `types`). Do not share business logic!
  - `docs/ADR/`: Architecture Decision Records tracking major architectural choices.
- **Layered DDD**: Each module within a service is strictly separated into:
  - `Controller` -> `Service` -> `Repository` -> `Entity`

## Getting Started 🚀
1. Install dependencies: `pnpm install`
2. Start the ecosystem: `docker-compose up -d --build`
3. Gateway: `http://localhost:3000`
4. Swagger Docs: `http://localhost:3000/api-docs`

## Features ✨
- **Identity**: Registration, Authentication, JWT, Roles.
- **Restaurant**: Menu management, Categories.
- **Order**: Cart, Checkout, Delivery tracking.
- **Observability**: Prometheus & Grafana integrated.
