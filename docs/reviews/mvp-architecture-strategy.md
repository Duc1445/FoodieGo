# MVP Architecture Strategy Review

## 1. Current Architecture
FoodieGo is designed as a Microservices Architecture within a Monorepo (`pnpm` workspaces), split into domain-driven services: Identity, Restaurant, Food, Order, Payment, and Inventory, along with an API Gateway.

## 2. MVP Advantages
- **Strict Boundaries**: Prevents spaghetti code. Teams or developers are forced to think about APIs and data contracts explicitly.
- **Future-Proof**: If FoodieGo scales rapidly post-MVP, the foundational architecture is already built for horizontal scaling.
- **Technology Isolation**: Different services can technically be written in different languages, though we stick to Node.js for simplicity right now.

## 3. MVP Risks
- **Development Speed**: High boilerplate for new features (needs DTOs, Controllers, Services, DB schemas across multiple apps).
- **Deployment Complexity**: CI/CD must build, test, and deploy multiple services instead of a single artifact.
- **Operational Cost**: Running multiple Node.js instances (plus Gateway, Redis, PostgreSQL, RabbitMQ) consumes significant memory, increasing hosting costs for a startup MVP.
- **Data Consistency**: Managing distributed transactions (e.g., placing an order and decrementing inventory) is extremely complex compared to a monolith's ACID transactions.

## 4. Recommended Approach
- **Keep Existing Architecture**: Do NOT revert to a Monolith. The logical boundaries are already drawn and working.
- **Simplify Deployment**: For MVP, deploy all services into a single lightweight cluster (e.g., Docker Compose on a single VM or a simple PaaS environment) to minimize Kubernetes/DevOps overhead.
- **Tolerate Eventual Consistency**: Accept eventual consistency for non-critical paths (e.g., search indexing) but use synchronous REST calls or optimistic locking for critical paths (e.g., Cart Checkout, Payment) to reduce event-driven complexity during MVP.

## 5. Migration Path (If needed)
If operational costs or development speed become critical blockers during Sprint 3 or 4, consider a "Modulith" approach:
- Mount all Express routers from the various services into a single root Express application for deployment, while keeping the source code separated in `apps/`. This collapses the operational footprint to 1 instance while preserving the microservice codebase.
