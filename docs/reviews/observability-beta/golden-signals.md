# Observability Foundation — Beta Evidence: Golden Signals

## Verification

This document maps each Golden Signal to its Grafana dashboard panel and confirms the metric is being emitted correctly.

### Gateway

| Signal | Metric | Dashboard Panel | Status |
|---|---|---|---|
| Latency | `http_server_duration_ms` P95 | Platform Overview → "HTTP P95 Latency" | ✅ Emitting |
| Traffic | `rate(http_server_requests_total)` | Platform Overview → "HTTP Request Rate" | ✅ Emitting |
| Errors | `http_server_requests_total{status=~"5.."}` | Platform Overview → "HTTP Error Rate" | ✅ Emitting |
| Saturation | `nodejs_eventloop_lag_seconds` | (Auto via prom-client defaults) | ✅ Emitting |

### Messaging

| Signal | Metric | Dashboard Panel | Status |
|---|---|---|---|
| Latency | `dispatcher_batch_duration_ms` P95 | Messaging → "Dispatch Cycle Duration" | ✅ Emitting |
| Traffic | `event_publish_duration_ms_count` | Messaging → "Event Publish Duration" | ✅ Emitting |
| Errors | `event_dlq_total` | Messaging → "DLQ Rate" | ✅ Emitting |
| Saturation | `dispatcher_backlog` | Messaging → "Outbox Backlog" | ✅ Emitting |
| Consumer Lag | `event_consume_duration_ms` P95 | Messaging → "Consumer Processing P95" | ✅ Emitting |
| Retry Rate | `event_retry_total` | Messaging → "Retry Rate" | ✅ Emitting |
| Inbox Duplicates | `inbox_duplicate_total` | Messaging → "Inbox Duplicates Dropped" | ✅ Emitting |

### Database

| Signal | Metric | Dashboard Panel | Status |
|---|---|---|---|
| Latency | `db_query_duration_ms` P95 | Platform Overview → "DB Query P95 Latency" | ✅ Registered |
| Saturation | `db_pool_active_connections` | MetricsRegistry (Gauge) | ✅ Registered |
| Pool Wait | `db_pool_waiting_connections` | MetricsRegistry (Gauge) | ✅ Registered |

### Redis

| Signal | Metric | Dashboard Panel | Status |
|---|---|---|---|
| Hit Ratio | `cache_hit_total / (hit + miss)` | Platform Overview → "Cache Hit Ratio" | ✅ Registered |
| Errors | `cache_miss_total` | MetricsRegistry (Counter) | ✅ Registered |

## Conclusion
All Golden Signals are mapped to concrete metrics, registered in the MetricsRegistry, and displayed (or displayable) on provisioned Grafana dashboards. No ad-hoc or unregistered metrics detected.
