# Golden Signals Definition

## Purpose
Golden Signals (from the Google SRE Book) define the four critical measurements for any distributed system. This document maps Golden Signals to concrete FoodieGo metrics, aligning operational monitoring with SRE language rather than raw Prometheus metric names.

---

## Gateway

| Signal | Metric | SLO Target | Alert Threshold |
|---|---|---|---|
| **Latency** | `http_server_duration_ms` (P95) | < 200ms | > 500ms for 5min → Warning, > 1000ms → Critical |
| **Traffic** | `rate(http_server_requests_total[5m])` | Baseline awareness | Drop > 50% from hourly average → Warning |
| **Errors** | `http_server_requests_total{status=~"5.."}` / total | < 0.1% | > 1% for 5min → Critical |
| **Saturation** | `nodejs_eventloop_lag_seconds` | < 100ms | > 500ms → Warning, > 1000ms → Critical |

---

## Messaging Runtime

| Signal | Metric | SLO Target | Alert Threshold |
|---|---|---|---|
| **Latency** | `dispatcher_batch_duration_ms` (P95) | < 500ms | > 2000ms for 5min → Warning |
| **Traffic** | `rate(event_publish_duration_ms_count[5m])` | Baseline awareness | Drop to 0 for 5min → Warning |
| **Errors** | `event_dlq_total` | < 0.1% of published | > 50 events in DLQ → Critical |
| **Saturation** | `dispatcher_backlog` | < 100 | > 500 → Warning, > 1000 → Critical |

### Additional Messaging Signals

| Signal | Metric | SLO Target | Alert Threshold |
|---|---|---|---|
| Consumer Lag | `event_consume_duration_ms` (P95) | < 1000ms | > 5000ms → Warning |
| Retry Rate | `rate(event_retry_total[5m])` | < 5% of consumed | > 10% → Warning |
| Inbox Duplicates | `rate(inbox_duplicate_total[5m])` | Informational | Spike > 100/min → Investigate |

---

## Database (PostgreSQL)

| Signal | Metric | SLO Target | Alert Threshold |
|---|---|---|---|
| **Latency** | `db_query_duration_ms` (P95) | < 50ms | > 200ms for 5min → Warning |
| **Traffic** | `rate(db_query_duration_ms_count[5m])` | Baseline | — |
| **Errors** | Slow queries (> 1s) as % of total | < 1% | > 5% → Critical |
| **Saturation** | `db_pool_active_connections` / max pool | < 80% | > 90% → Critical |

### Additional DB Signals

| Signal | Metric | SLO Target |
|---|---|---|
| Pool Waiting | `db_pool_waiting_connections` | 0 (no queuing) |
| Deadlocks | pg_stat `deadlocks` counter | 0 |

---

## Redis (Cache)

| Signal | Metric | SLO Target | Alert Threshold |
|---|---|---|---|
| **Latency** | Redis command duration (auto-instrumented) | < 5ms | > 50ms → Warning |
| **Traffic** | `rate(cache_hit_total[5m]) + rate(cache_miss_total[5m])` | Baseline | — |
| **Errors** | Evictions | 0 under normal load | > 100/min → Warning |
| **Saturation** | Redis `used_memory` / `maxmemory` | < 80% | > 90% → Critical |

### Additional Cache Signals

| Signal | Metric | SLO Target |
|---|---|---|
| Hit Ratio | `cache_hit_total / (hit + miss)` | > 80% |
