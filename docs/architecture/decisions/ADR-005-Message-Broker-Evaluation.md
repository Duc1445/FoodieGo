# ADR 005: Message Broker Evaluation

## Status
Proposed

## Context
FoodieGo is migrating towards an Event-Driven Architecture starting in Sprint B1.4. The messaging foundation needs to support reliable delivery, outbox dispatching, dead-letter queues (DLQ), retry with exponential backoff, and consumer scaling. We evaluated three popular message brokers: RabbitMQ, Apache Kafka, and NATS JetStream.

## Evaluation Criteria & Comparison

| Tiêu chí | RabbitMQ | Apache Kafka | NATS JetStream |
| --- | --- | --- | --- |
| **Throughput** | Medium-High (10k-50k msg/s) | Very High (100k+ msg/s) | High (50k-100k msg/s) |
| **Ordering** | Per-queue ordering | Strict partition-level ordering | Per-subject ordering |
| **Delay Queue** | Supported (via Dead Letter Exchange / Delayed Message Plugin) | Complex (requires custom topic routing / external timers) | Not natively designed for delayed scheduling |
| **Retry / DLQ** | Built-in routing, native DLX support. Very natural for retries. | Requires creating manual retry topics (Retry-1, Retry-2, DLQ). | Supported via Nak + delay, DLQ is possible but less standard than RMQ. |
| **Consumer Groups** | Shared Queues (Competing Consumers) | Native Consumer Groups | Consumer Groups (Queue Groups) |
| **Operational Complexity**| Low/Medium (Easy UI, stable) | High (ZooKeeper/KRaft, JVM tuning) | Low (Single binary, extremely simple) |
| **Local Development** | Excellent (Docker image + Management UI) | Medium (Docker image is heavy) | Excellent (Lightweight Docker) |
| **FoodieGo Fit** | **High**. Focus is on task routing, robust retry/DLQ (critical for payments/orders), and simple operations. | **Medium**. Overkill for current scale; retry/DLQ implementation is complex. | **Medium-High**. Fast and light, but less mature ecosystem for delayed/DLQ routing compared to RMQ. |

## Decision
**We propose selecting RabbitMQ as the Primary Message Broker.**

### Rationale:
1. **Retry & DLQ Priority**: FoodieGo's architecture relies heavily on resilient tasks (Payment, Notification). RabbitMQ's built-in DLX (Dead Letter Exchange) and routing capabilities make implementing robust Exponential Backoff and DLQ patterns significantly easier than Kafka.
2. **Operational Simplicity**: Provides an excellent Management UI out-of-the-box, making debugging and local development seamless.
3. **Throughput**: While Kafka handles higher throughput, RabbitMQ easily scales to meet the demands of a food delivery platform at our projected scale (thousands of orders/hour).

## Consequences
- We will design the `BrokerAdapter` interface to be broker-agnostic, but the initial implementation will be `RabbitMQAdapter`.
- We will utilize RabbitMQ's `x-dead-letter-exchange` feature to implement the Retry and DLQ mechanisms defined in Milestone A2.
