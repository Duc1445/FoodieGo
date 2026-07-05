# Observability Foundation — Beta Evidence: Chaos Testing

## Purpose
Verify that the Observability Platform itself is resilient to failures. The system being monitored may fail, but the monitoring must not silently break.

---

## Scenario 1: Service Kill Mid-Request
- **Trigger**: Kill `order-service` container while Gateway is actively proxying a checkout request.
- **Expected Trace**: Root span (Gateway) shows child span to `order-service` with `status=ERROR`. No orphan spans. Trace is complete up to the failure point.
- **Expected Metrics**: `http_server_requests_total{status="503"}` increments on Gateway. `GatewayHighErrorRate` alert fires.
- **Expected Logs**: Gateway error log with `traceId` correlates to the failed trace in Tempo.
- **Status**: ⏳ Pending runtime execution.

## Scenario 2: RabbitMQ Restart
- **Trigger**: Restart `rabbitmq` container while Dispatcher is publishing and Consumer is processing.
- **Expected Trace**: Events published before restart have complete traces. Events published after restart resume with new trace context from the Outbox (inheriting original trace from `outbox_events.trace_id` is a future enhancement; currently a new trace starts at Dispatcher).
- **Expected Metrics**: `dispatcher_batch_duration_ms` spikes during downtime. `dispatcher_backlog` increases then drains.
- **Expected Logs**: Dispatcher logs `[RabbitMQ] Connection error` with traceId.
- **Status**: ⏳ Pending runtime execution.

## Scenario 3: Tempo Unavailable
- **Trigger**: Kill `tempo` container.
- **Expected Behavior**: Services continue to operate normally. `@foodiego/tracing` SDK logs export errors but does NOT crash or block the application. Traces are lost during downtime but resume when Tempo comes back.
- **Expected Impact**: Zero impact on business logic. Tracing SDK is fire-and-forget.
- **Status**: ⏳ Pending runtime execution.

## Scenario 4: Loki Unavailable
- **Trigger**: Kill `loki` container.
- **Expected Behavior**: Logs continue to emit to stdout. If a log shipper (e.g., Promtail) is configured, it buffers and retries. No log entries are lost from the application's perspective.
- **Status**: ⏳ Pending runtime execution.

## Scenario 5: Consumer Crash — Error Span Accuracy
- **Trigger**: Deploy a consumer that throws `new Error('Simulated failure')` on every event.
- **Expected Trace**: Consumer span has `status=ERROR`, `exception.message`, and `exception.stacktrace` attached.
- **Expected Metrics**: `event_consume_failures_total` increments. `event_retry_total` increments per retry. `event_dlq_total` increments after retries exhausted.
- **Expected Logs**: Each failure logged with `traceId` and `err` object (auto-serialized by Pino).
- **Status**: ⏳ Pending runtime execution.

---

## Execution Notes

All scenarios require the full `docker compose` stack. Results (with screenshots from Grafana/Tempo) will be appended to this document after execution.

### Pre-conditions
1. `docker compose up -d` — all services healthy.
2. Seed data loaded (restaurants, menu items).
3. Valid JWT token available for authenticated requests.
