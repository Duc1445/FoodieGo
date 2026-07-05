# Chaos Testing Scenarios

To guarantee reliability, we've designed and executed the following chaos engineering scenarios on the Messaging Runtime:

## Scenario 1: RabbitMQ Downtime
- **Trigger**: Kill the RabbitMQ Docker container while the Dispatcher is actively polling.
- **Expected**: Dispatcher catches `ECONNREFUSED`. Events remain `IN_PROGRESS` until the lease expires, then revert to `PENDING`. No events are marked `PUBLISHED`.
- **Result**: Passed. Dispatcher sleeps gracefully and resumes publishing when RabbitMQ comes back online.

## Scenario 2: Dispatcher Kill
- **Trigger**: Send `SIGKILL` (kill -9) to the Dispatcher process mid-batch.
- **Expected**: Events locked by the dead Dispatcher have a `lease_until` in the future. Once the lease expires (e.g., 30s), a newly started Dispatcher picks them up.
- **Result**: Passed. No duplicate publications and no stuck events.

## Scenario 3: Consumer Crash (Poison Message)
- **Trigger**: Consumer business logic consistently throws `new Error('Simulated Crash')`.
- **Expected**: Event hits the `RetryManager`. RabbitMQ NACKs it and routes it to `foodiego.retry.1000`, waits 1s, redelivers. After N attempts, routes to DLQ (`dead_letter_events` DB table).
- **Result**: Passed. DLQ table properly records the failure reason and attempt count.

## Scenario 4: Concurrency Check
- **Trigger**: Spin up 3 Dispatcher instances against the same database.
- **Expected**: `FOR UPDATE SKIP LOCKED` ensures no two dispatchers fetch the same row. Total events published matches exactly the number of rows in `outbox_events`.
- **Result**: Passed. Zero overlap.

## Scenario 5: Database Dies During Publish
- **Trigger**: Database connection drops exactly after RabbitMQ confirms publish but before Dispatcher can run `UPDATE status = 'PUBLISHED'`.
- **Expected**: Events stay `IN_PROGRESS`. Another Dispatcher picks them up later and republishes. Consumer receives duplicates but drops them via the `inbox_events` Idempotency check.
- **Result**: Passed. Exactly-once business logic maintained.

## Scenario 6: Consumer Crash Pre-ACK
- **Trigger**: Consumer completes business logic, updates `inbox_events` to `COMPLETED`, but crashes before `this.channel.ack(msg)` is called.
- **Expected**: RabbitMQ requeues the message. Consumer receives it again, sees `COMPLETED` in `inbox_events`, drops it, and ACKs immediately.
- **Result**: Passed. Inbox pattern successfully prevents side-effects.
