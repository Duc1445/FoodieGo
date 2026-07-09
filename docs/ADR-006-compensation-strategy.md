# ADR 006: Compensation Strategy

## Status
Accepted

## Context
When an order is created, it spans multiple domains: Checkout, Inventory, and Payment. If any step fails (e.g., Restaurant Rejects the order after Payment is captured), we must roll back the system. Traditional 2PC (Two-Phase Commit) is not suitable for distributed microservices due to locking overhead and availability concerns.

We evaluated two patterns for the Saga:
1. **Orchestrator**: A central `OrderSagaManager` issues command events (`CancelOrderCommand`, `RefundPaymentCommand`).
2. **Choreography**: Services publish Domain Events and other services listen and react to them independently.

## Decision
We chose the **Choreography** pattern for our Compensation Matrix.
- Order Service listens to `RestaurantRejected` and transitions the order to `CANCELLED`, then publishes `OrderCancelled`.
- Payment Service listens to `OrderCancelled` and invokes the Payment Aggregate to issue a Refund, then publishes `PaymentRefunded`.

## Rationale
- **Loose Coupling**: Payment does not need to know about Restaurants or Inventory.
- **Resilience**: There is no central orchestrator point of failure.
- **Idempotency**: Downstream consumers enforce strict idempotency (e.g. `refund_idempotency_key = payment_id + reason_hash`) ensuring repeated events do not cause double refunds.

## Consequences
- Requires strict tracking of Domain Events to Integration Events.
- Tracing is harder but solved via OpenTelemetry Trace Propagation through RabbitMQ headers.
