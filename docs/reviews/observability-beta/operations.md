# Observability Foundation — Beta Evidence: Operations Runbook

## 1. Querying Traces (Grafana Tempo)

### Find a trace by ID
1. Open Grafana → Explore → Select "Tempo" datasource.
2. Enter `TraceQL`: `{ traceID = "abc123..." }`.

### Find traces by service
```
{ resource.service.name = "order-service" && status = error }
```

### Find slow traces
```
{ resource.service.name = "gateway" && duration > 500ms }
```

---

## 2. Querying Logs (Grafana Loki)

### Find logs for a specific trace
```logql
{service="order-service"} | json | traceId="4bf92f3577b34da6a3ce929d0e0e4736"
```

### Find all errors in a service
```logql
{service="order-service"} | json | severity="ERROR"
```

### Find logs around a specific time
```logql
{service="gateway"} | json | duration > 500
```

---

## 3. Investigating a Failed Order

**Scenario**: Customer reports order checkout failed.

**Steps**:
1. Get the `requestId` from the customer (returned in `x-request-id` response header).
2. Search Loki: `{service="order-service"} | json | requestId="<id>"`.
3. Find the `traceId` from the log entry.
4. Open Tempo with that `traceId` → view full trace waterfall.
5. Identify the failing span (marked red).
6. Click the span → read `exception.message` and `exception.stacktrace`.
7. Check if the error is in business logic or infrastructure.

---

## 4. Investigating DLQ Events

**Scenario**: `DLQThresholdExceeded` alert fires.

**Steps**:
1. Query DLQ table:
   ```sql
   SELECT event_type, reason, COUNT(*) 
   FROM dead_letter_events 
   WHERE failed_at > NOW() - INTERVAL '1 hour'
   GROUP BY event_type, reason 
   ORDER BY count DESC;
   ```
2. Identify the failing event type and root cause.
3. Fix the consumer bug.
4. Replay events:
   ```bash
   # Dry run first
   node packages/events/src/cli/replay.js --event OrderCreated --from 2026-07-05 --limit 10
   
   # If dry run looks good, replay (currently replays by default)
   node packages/events/src/cli/replay.js --event OrderCreated --from 2026-07-05 --limit 500
   ```
5. Monitor `dispatcher_backlog` and `event_consume_failures_total` to confirm recovery.

---

## 5. Investigating High Latency

**Scenario**: `GatewayHighLatency` alert fires.

**Steps**:
1. Open Platform Overview dashboard → "HTTP P95 Latency" panel.
2. Identify which service has the highest latency.
3. Open Tempo → search for slow traces (`duration > 500ms`).
4. In the trace waterfall, identify the bottleneck span (longest bar).
5. Common causes:
   - DB query without index → check `db.statement` attribute → run `EXPLAIN ANALYZE`.
   - Redis cache miss → check `cache_miss_total` metric.
   - Downstream service timeout → check service health.

---

## 6. Scaling the Dispatcher

**Scenario**: `DispatcherBacklogHigh` alert fires.

**Steps**:
1. Check `dispatcher_backlog` gauge.
2. Check if Dispatcher is running: `docker ps | grep dispatcher`.
3. If Dispatcher is dead → restart it.
4. If Dispatcher is alive but slow:
   - Check RabbitMQ connectivity.
   - Check `dispatcher_batch_duration_ms` for increased latency.
   - Scale horizontally: start additional Dispatcher instances (`SKIP LOCKED` ensures no overlap).

---

## 7. Disabling Telemetry in Emergency

If telemetry is causing performance issues:

```env
# Disable tracing (zero overhead)
OTEL_ENABLED=false

# Disable metrics collection
METRIC_ENABLED=false

# Reduce log verbosity
LOG_LEVEL=error
```

Restart services. No code changes needed.
