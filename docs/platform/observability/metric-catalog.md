# Metric Catalog

## Purpose
This catalog is the **single source of truth** for all Prometheus metrics in FoodieGo. No service may create metrics outside of this catalog. All metrics are registered and managed by `@foodiego/metrics` (`MetricsRegistry`).

---

## Ownership & Versioning

| Column | Description |
|---|---|
| **Metric** | Prometheus metric name |
| **Type** | `Counter`, `Histogram`, `Gauge` |
| **Owner** | Team/package responsible |
| **Labels** | Allowed label names |
| **Introduced** | SDK version that added it |
| **Deprecated** | SDK version that deprecated it (empty = active) |

---

## HTTP Metrics

| Metric | Type | Owner | Labels | Introduced | Deprecated |
|---|---|---|---|---|---|
| `http_server_duration_ms` | Histogram | Platform | `service`, `route`, `method`, `status` | 1.0.0 | — |
| `http_server_requests_total` | Counter | Platform | `service`, `route`, `method`, `status` | 1.0.0 | — |

---

## Database Metrics

| Metric | Type | Owner | Labels | Introduced | Deprecated |
|---|---|---|---|---|---|
| `db_query_duration_ms` | Histogram | Platform | `service`, `operation`, `collection` | 1.0.0 | — |
| `db_pool_active_connections` | Gauge | Platform | `service` | 1.0.0 | — |
| `db_pool_waiting_connections` | Gauge | Platform | `service` | 1.0.0 | — |

---

## Messaging / Event Metrics

| Metric | Type | Owner | Labels | Introduced | Deprecated |
|---|---|---|---|---|---|
| `event_publish_duration_ms` | Histogram | Platform | `service`, `event_type`, `consumer` | 1.0.0 | — |
| `event_consume_duration_ms` | Histogram | Platform | `service`, `event_type`, `consumer` | 1.0.0 | — |
| `event_consume_failures_total` | Counter | Platform | `service`, `event_type`, `consumer` | 1.0.0 | — |
| `event_retry_total` | Counter | Platform | `service`, `event_type` | 1.0.0 | — |
| `event_dlq_total` | Counter | Platform | `service`, `event_type` | 1.0.0 | — |
| `inbox_duplicate_total` | Counter | Platform | `service`, `consumer` | 1.0.0 | — |

---

## Dispatcher Metrics

| Metric | Type | Owner | Labels | Introduced | Deprecated |
|---|---|---|---|---|---|
| `dispatcher_batch_duration_ms` | Histogram | Platform | `service` | 1.0.0 | — |
| `dispatcher_batch_size` | Histogram | Platform | `service` | 1.0.0 | — |
| `dispatcher_backlog` | Gauge | Platform | `service` | 1.0.0 | — |

---

## Cache Metrics

| Metric | Type | Owner | Labels | Introduced | Deprecated |
|---|---|---|---|---|---|
| `cache_hit_total` | Counter | Platform | `service` | 1.0.0 | — |
| `cache_miss_total` | Counter | Platform | `service` | 1.0.0 | — |

---

## Node.js Runtime Metrics

Collected automatically by `prom-client` with prefix `nodejs_`. Includes:
- `nodejs_heap_size_total_bytes`
- `nodejs_heap_size_used_bytes`
- `nodejs_eventloop_lag_seconds`
- `nodejs_active_handles_total`
- `nodejs_gc_duration_seconds`

---

## Rules

1. **No ad-hoc metrics.** If a metric is not in this catalog, it cannot be registered.
2. **Adding a metric** requires a PR that updates this catalog AND the `MetricsRegistry` class.
3. **Deprecating a metric** requires setting the `Deprecated` column to the version where it is removed, providing at least 1 minor version of deprecation notice.
4. **Label cardinality**: Maximum unique values per label should not exceed ~100. If a label risks exceeding this (e.g., unbounded route paths), use normalization (e.g., parameterized routes `/orders/:id` instead of `/orders/abc123`).
