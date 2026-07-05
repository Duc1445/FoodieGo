# ADR 007: Outbox Evolution Roadmap

## Status
Proposed (Roadmap)

## Context
Our current Outbox Dispatcher uses PostgreSQL polling (`FOR UPDATE SKIP LOCKED`). While this is excellent for our current scale (handling ~2000 events/sec), as the platform scales to millions of events per day, constant database polling will create unnecessary load and contention on the primary database.

## Decision
We establish the following evolution path for the Messaging Platform's Outbox pattern:

### Phase 1: Polling with SKIP LOCKED (Current - Production)
- **Mechanism**: Active polling workers.
- **Pros**: Simple, no external dependencies, high reliability.
- **Cons**: Constant DB queries even when idle, upper limit on throughput.

### Phase 2: CDC (Change Data Capture) with Logical Replication (Future)
- **Mechanism**: Debezium + Kafka Connect (or native Postgres Logical Decoding).
- **Pros**: Eliminates polling completely. Reacts instantly to transaction commits. Moves load off the primary DB engine to the replication stream.
- **Cons**: High operational complexity (requires Kafka Connect cluster, Debezium tuning, handling schema registry).

## Evolution Triggers
We will migrate to Phase 2 (Debezium/CDC) when:
1. **Database CPU**: Polling consistently accounts for >20% of database CPU utilization during peak hours.
2. **Throughput Requirements**: The platform exceeds 10,000 sustained events per second.
3. **Latency**: The polling interval creates unacceptable propagation delay for critical downstream services.

## Consequences
- The transition to CDC will require replacing the custom Outbox Dispatcher with Debezium connectors.
- Kafka will likely need to be adopted alongside or in place of RabbitMQ to natively support Kafka Connect ecosystem.
