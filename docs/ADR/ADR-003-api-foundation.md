# ADR 003: API Foundation

## Status
Approved

## Context
As FoodieGo transitions from a monolithic prototype to a scalable microservices architecture (Layered DDD Monorepo), we needed to establish a unified API Foundation. Before Milestone 1, each microservice handled errors, responses, logging, and configurations in its own isolated way, leading to code duplication and inconsistency. Without a standardized approach, onboarding new services (e.g., Cart, Order, Payment) would multiply technical debt and complicate Observability.

## Decision
We decided to implement a shared `packages/core` library that acts as the Platform Layer for all microservices in the Monorepo.

### 1. Structured Logging with Pino
- **Alternative:** `winston` or `morgan` + `console.log`.
- **Decision:** `pino`.
- **Reason:** Pino is exceptionally fast and outputs structured JSON logs by default, which is vital for log aggregation tools (Grafana Loki, ELK, Datadog). It integrates seamlessly with modern Node.js ecosystems (e.g., Fastify, NestJS). 

### 2. Standardized Response Envelope
- **Decision:** Every API response follows a strict schema: `{ success, data, pagination, request: { id, timestamp }, error }`.
- **Reason:** Eliminates parsing guesswork on the frontend and ensures critical metadata (Correlation ID, Pagination) is consistently available. The `pagination` block is selectively returned only when applicable to reduce payload size.

### 3. Application Error Hierarchy
- **Decision:** Replacing primitive `throw new Error()` with an OOP hierarchy (`AppError -> DomainError, InfrastructureError, ValidationError`).
- **Reason:** Separating Domain Errors (e.g., `RestaurantNotFoundError`) from Infrastructure Errors (e.g., `DatabaseError`) allows the centralized Error Middleware to gracefully handle business logic exceptions (returning 400/404) vs. unexpected systemic failures (returning 500 + logging stack traces).

## Consequences
- **Positive:** Uniform API contract across Identity, Restaurant, Order, and future services. High observability out of the box (Request Traceability via Correlation IDs). Centralized configuration and validation management.
- **Negative:** Adds a slight learning curve for developers who must strictly use `@foodiego/core` utilities instead of relying on familiar but chaotic `console.log` or raw express responses. Any breaking change in `packages/core` impacts the entire monorepo.
