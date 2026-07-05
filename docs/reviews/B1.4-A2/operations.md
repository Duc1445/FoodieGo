# Operations Runbook (Messaging)

This runbook guides DevOps and SREs on operating the FoodieGo Messaging Platform.

## 1. Viewing the Backlog
To check if events are stuck, monitor the Dispatcher backlog in PostgreSQL:
```sql
SELECT status, COUNT(*) FROM outbox_events GROUP BY status;
```
If `PENDING` is constantly growing, the Dispatchers are dead or too slow. If `IN_PROGRESS` is stuck, there may be network partitions between Dispatcher and RabbitMQ.

## 2. Draining the DLQ
Events that exhaust their retry policies end up in the `dead_letter_events` table.
To view failures:
```sql
SELECT event_type, reason, failed_at FROM dead_letter_events ORDER BY failed_at DESC LIMIT 50;
```

## 3. Replaying Events
Once a bug is fixed, use the CLI to replay events from the DLQ. **Do not modify the database manually.**

```bash
cd packages/events
node src/cli/replay.js --event OrderCreated --from 2026-07-01 --limit 500
```
This will fetch 500 `OrderCreated` events that failed after July 1st, republish them to RabbitMQ, and delete them from the DLQ table.

## 4. Scaling Dispatchers
You can scale the Outbox Dispatcher horizontally simply by running more containers/pods.
The SQL `SKIP LOCKED` guarantees they will evenly distribute the load without duplicate processing.

## 5. Graceful Shutdown
To update code, send a `SIGTERM` to the Node.js process:
```bash
kill -TERM <pid>
```
The Dispatcher will log `Stopping worker... waiting for current batch to finish.`, wait for the current SQL transaction and RabbitMQ Confirms to complete, and then exit cleanly. Kubernetes `preStop` hooks should allow at least 15 seconds for this.
