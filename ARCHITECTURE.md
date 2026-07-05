# Architecture

FoodieGo uses a **Microservices Architecture** with **Layered Domain-Driven Design (DDD)**.

For detailed architecture records and decisions, please refer to the `docs/` folder:

- **ADRs (Architecture Decision Records):** `docs/adr/`
- **Platform Architecture:** `docs/platform/`
- **Reviews & Evidence:** `docs/reviews/`

## High-Level Components

- **API Gateway**: Edge routing and rate limiting.
- **Identity Service**: Authentication and user management.
- **Restaurant Service**: Menu and store discovery.
- **Order Service**: Cart management and checkout process.
- **Messaging (RabbitMQ)**: Event-driven communication using Outbox/Inbox patterns.
- **Observability**: OpenTelemetry SDKs, Grafana, Prometheus, Loki, Tempo.
