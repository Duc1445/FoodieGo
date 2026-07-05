# Outbox Dispatcher Design (Milestone A1)

## Overview
The Outbox Dispatcher is responsible for reading records from the `outbox_events` table and publishing them to the Message Broker. To ensure high availability and throughput, we must allow multiple dispatcher instances (or workers) to run concurrently without publishing duplicate events or causing database deadlocks.

## Concurrency Strategy: `FOR UPDATE SKIP LOCKED`
Instead of a simple `SELECT ... WHERE status = 'PENDING'`, which would cause multiple workers to fetch the exact same events, we utilize PostgreSQL's `SKIP LOCKED` feature.

### The Dispatch Query
```sql
WITH locked_events AS (
  SELECT event_id
  FROM outbox_events
  WHERE status = 'PENDING'
  ORDER BY occurred_at ASC
  LIMIT $1
  FOR UPDATE SKIP LOCKED
)
UPDATE outbox_events
SET status = 'PROCESSING', processed_at = NOW()
WHERE event_id IN (SELECT event_id FROM locked_events)
RETURNING *;
```

### How it works:
1. **`FOR UPDATE`**: Places a row-level lock on the selected events, preventing other transactions from modifying them.
2. **`SKIP LOCKED`**: If another dispatcher is currently locking row 1, this query will immediately skip row 1 and lock row 2 instead of waiting for row 1 to be released. This eliminates lock contention.
3. **`RETURNING *`**: Returns the locked and updated rows to the application code in a single round-trip.

## Dispatch Flow
1. **Poll**: The Dispatcher runs a cron/setInterval (e.g., every 500ms).
2. **Batch Fetch & Lock**: Executes the CTE query above to grab a batch of N events (e.g., 50).
3. **Publish**: Iterates through the batch and calls `EventPublisher.publishBatch()`.
4. **Mark Completed**: 
   ```sql
   UPDATE outbox_events 
   SET status = 'PUBLISHED' 
   WHERE event_id IN (...successful_ids);
   ```
5. **Handle Failures**: If the publish fails (e.g., Broker is down), the events remain in `PROCESSING` state. A separate cleanup job can reset `PROCESSING` events back to `PENDING` if they've been stuck for > 5 minutes.

## Advantages
- **No Overlapping**: Workers safely process mutually exclusive batches.
- **High Throughput**: No waiting on locks.
- **Resilience**: Simple to retry if a worker crashes mid-publish.
