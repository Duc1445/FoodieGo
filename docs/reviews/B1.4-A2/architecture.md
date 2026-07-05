# Platform Messaging Architecture

The Messaging Runtime serves as the core communication layer between microservices, ensuring eventual consistency, reliable delivery, and full operational transparency.

## Core Components
1. **Outbox Events (DB)**: Source of truth for all outgoing events, inserted as part of the business transaction.
2. **Outbox Dispatcher**: A stateless, self-scheduling worker that polls `outbox_events` using `FOR UPDATE SKIP LOCKED`. It manages lease ownership to ensure high availability and prevent overlaps.
3. **Event Publisher**: The application-facing interface. Business logic never touches RabbitMQ directly.
4. **RabbitMQ Adapter**: The concrete infrastructure implementation. It uses `Publisher Confirms` to guarantee that messages are securely stored in the broker before marking them `PUBLISHED` in the database.
5. **Event Consumer / Inbox**: Platform intercepts the message, checks the `inbox_events` table for exactly-once semantics, executes business logic, records processing duration, and explicitly ACKs or triggers Retry.

## Dependency Rules
- **Platform Agnosticism**: The `packages/events` package has zero dependencies on business models.
- **Config-Driven Routing**: Retries and DLQ routing are driven by policies (`config/retry.policy.json`), allowing different SLAs (e.g., Fast vs. Reliable vs. Payment) without code changes.
