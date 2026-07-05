# Dependency Rules

To maintain a clean and scalable architecture, FoodieGo strictly enforces the following dependency directions:

## Core Hierarchy
```text
Business (Domain) -> Application (Use Cases) -> Platform (Core/Events) -> Infrastructure (Broker/DB)
```

## The Rules
1. **Platform Cannot Import Business**: 
   - `packages/events`, `packages/telemetry`, `packages/security`, etc., must remain completely agnostic of the business domain. 
   - They cannot import anything from `apps/order-service` or `apps/food-service`.
2. **Infrastructure Implements Interfaces**:
   - The Application layer defines interfaces (e.g., `EventPublisher`).
   - The Infrastructure layer provides the concrete implementation (e.g., `RabbitMQPublisher`).
   - The Application layer depends *only* on the interface.
3. **Domain Events**:
   - Services must use the standard `EventEnvelope` defined in `packages/events/src/envelope`.
   - Event types must be registered in the `EventRegistry`. No ad-hoc string literals for event types.
4. **No Cross-Service Database Access**:
   - A service can only access its own database schema.
   - If `order-service` needs data from `food-service`, it must use a Gateway (HTTP) or consume an Event.
