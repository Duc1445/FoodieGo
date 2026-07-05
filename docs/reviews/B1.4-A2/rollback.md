# Rollback Strategy & Feature Flags

Rolling back a messaging infrastructure via Git can cause severe data inconsistencies (e.g., messages trapped in a broker that code no longer listens to). 

## Feature Flags
We rely on Environment Variables (Feature Flags) to toggle infrastructure components without deploying new code:

```env
# Toggles the Outbox Dispatcher
ENABLE_EVENT_DISPATCHER=true

# Toggles Consumers binding to RabbitMQ
ENABLE_EVENT_CONSUMERS=true
```

## Rollback Scenarios

### Scenario 1: Dispatcher is publishing malformed events
**Action**: Set `ENABLE_EVENT_DISPATCHER=false` and restart.
**Result**: Events safely queue up in the `outbox_events` table (DB) without being published. Once the bug is fixed, toggle it back on to resume draining.

### Scenario 2: Consumer is corrupting data
**Action**: Set `ENABLE_EVENT_CONSUMERS=false` and restart.
**Result**: Events queue up safely inside RabbitMQ queues. Once the business logic bug is fixed, toggle consumers back on to process the backlog.

### Scenario 3: RabbitMQ entirely corrupted
**Action**: Disable both Dispatcher and Consumers. Let events pile up in Postgres Outbox. Spin up a fresh RabbitMQ cluster, then re-enable Dispatcher.
