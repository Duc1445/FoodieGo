# ADR 007: DLQ Replay Architecture

## Status
Accepted

## Context
Messages that fail processing repeatedly are sent to a Dead Letter Queue (DLQ) (`dead_letter_events` table). We need a mechanism to safely replay these messages back into the system once the underlying bug or infrastructure issue is fixed.

## Decision
We decided against directly updating the DLQ table or publishing directly to the original queue from a CLI script. Instead, we are implementing a **Replay Exchange Architecture**:
1. CLI Script (`replay-dlq.js`) reads from `dead_letter_events` with `LIMIT 100` to prevent memory bloat.
2. The script logs the intent to replay into an immutable `replay_history` table.
3. The script wraps the payload into a `ReplayEnvelope` (injecting `x-replay-id`, `x-replay-reason`) and publishes it to a dedicated `replay_exchange`.
4. A dedicated `ReplayConsumer` listens to `replay_exchange`, enforces rate limits via `prefetch`, and forwards the message to the original `foodiego_exchange`.

## Rationale
- **Auditability**: `replay_history` provides a tamper-proof log of who replayed what and why.
- **Safety**: Publishing to a `replay_exchange` allows us to introduce a kill switch or rate limiter on the consumer side without affecting normal traffic.
- **Idempotency**: The `x-replay-id` allows downstream consumers to recognize that a message is a replay, bypassing duplication checks if necessary or utilizing it for logging.

## Consequences
- Slight increase in infrastructure complexity (extra exchange/queue).
- Replays are asynchronous.
