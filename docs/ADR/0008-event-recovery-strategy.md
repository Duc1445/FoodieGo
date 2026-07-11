# ADR 0008: Event Recovery and Message Failure Strategy

## Status
Accepted

## Context
FoodieGo uses an event-driven architecture (RabbitMQ) for inter-service communication, particularly for CQRS patterns (e.g., Food Service projecting restaurant data). In an MVP environment, network glitches, service restarts, or bad message payloads are inevitable. We need a strategy to ensure eventual consistency without building an overly complex distributed tracing system.

## Decision
We will implement a simple but robust event recovery strategy for the MVP:

1. **Event Failure Handling & Retries**:
   - Consumers must implement a local retry mechanism (e.g., 3 retries with exponential backoff) for transient errors (e.g., database deadlock, temporary network drop).
   - If a message fails after 3 retries, it MUST NOT be silently dropped.

2. **Dead Letter Queue (DLQ)**:
   - All critical queues must be configured with a Dead Letter Exchange/Queue.
   - Messages that fail processing completely are routed to the DLQ.
   - For MVP, DLQs will be monitored manually, and a simple admin script will be provided to replay messages from the DLQ.

3. **Projection Rebuild (CQRS)**:
   - Services relying on CQRS projections (e.g., Food Service caching Restaurant metadata) must have a REST endpoint (e.g., `POST /api/internal/projections/rebuild`) that clears the local cache and re-fetches the entire dataset synchronously from the Source of Truth service. This acts as an emergency "reset button" if events are lost.

4. **Event Versioning**:
   - All events must carry a `version` field in their payload.
   - For MVP, consumers can ignore older versions if they have already processed a newer version of an entity, preventing out-of-order execution bugs.

## Consequences
- **Positive**: Prevents silent data loss. Gives the team an emergency fallback (sync rebuild) if the event bus fails.
- **Negative**: Adds slight configuration overhead to RabbitMQ queues (setting up DLQs) and requires building manual projection rebuild scripts.
