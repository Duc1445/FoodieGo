# ADR-002: Strict Outbox Pattern Implementation

**Date:** 2026-07-06
**Status:** Accepted

## Context
In previous services, events were sometimes published directly to RabbitMQ during an active database transaction. This led to edge cases where the message broker received the event, but the database transaction subsequently rolled back, resulting in ghost events and system inconsistencies.

## Decision
All event publishing in the Payment Service (and moving forward across the project) must adhere strictly to the Outbox Pattern. A transaction must only contain business state updates and an `INSERT` into the local `outbox` table.

## Alternatives
- **Direct Publishing:** Publish to RabbitMQ inside the transaction. Rejected due to dual-write problems.
- **CDC (Change Data Capture):** Use tools like Debezium. Rejected as it introduces heavy infrastructure overhead for this project scale.

## Consequences
- **Positive:** Guaranteed exactly-once delivery semantics (at-least-once from Outbox dispatcher, deduped via Inbox at the consumer).
- **Positive:** System remains consistent even if RabbitMQ experiences brief outages.
- **Negative:** Requires a dedicated background worker (`dispatcher.worker.js`) to continuously poll and publish from the outbox table.
