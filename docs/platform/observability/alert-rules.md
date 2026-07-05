# Alert Rule Specification

## Purpose
This document defines production alert rules for FoodieGo. Every alert has a clear condition, severity, owner, and a link to the runbook describing the remediation steps.

---

## Severity Levels

| Severity | Response Time | Notification | Escalation |
|---|---|---|---|
| **Critical** | < 15 min | Slack #alerts + PagerDuty | On-call engineer → Team Lead (30min) |
| **Warning** | < 1 hour | Slack #alerts | On-call engineer |
| **Info** | Best effort | Slack #observability | — |

---

## Alert Rules

### Gateway

| Alert Name | Condition | Duration | Severity | Owner | Runbook |
|---|---|---|---|---|---|
| `GatewayHighErrorRate` | `rate(http_server_requests_total{service="gateway",status=~"5.."}[5m]) / rate(http_server_requests_total{service="gateway"}[5m]) > 0.01` | 5min | Critical | Platform | Check downstream service health, review error logs in Loki |
| `GatewayHighLatency` | `histogram_quantile(0.95, rate(http_server_duration_ms_bucket{service="gateway"}[5m])) > 500` | 5min | Warning | Platform | Check DB pool saturation, Redis hit ratio, service CPU |
| `GatewayLatencyCritical` | Same metric `> 1000` | 5min | Critical | Platform | Scale pods, check for deadlocks, review slow query log |
| `GatewayTrafficDrop` | `rate(http_server_requests_total{service="gateway"}[5m]) < 0.5 * avg_over_time(rate(http_server_requests_total{service="gateway"}[5m])[1h:])` | 10min | Warning | Platform | Verify upstream (load balancer, DNS), check service health |

### Messaging

| Alert Name | Condition | Duration | Severity | Owner | Runbook |
|---|---|---|---|---|---|
| `DLQThresholdExceeded` | `sum(event_dlq_total) > 50` | immediate | Critical | Platform | Run `replay.js --dry-run`, inspect `dead_letter_events`, fix consumer bug |
| `DispatcherBacklogHigh` | `dispatcher_backlog > 500` | 5min | Warning | Platform | Scale dispatcher instances, check RabbitMQ connectivity |
| `DispatcherBacklogCritical` | `dispatcher_backlog > 1000` | 5min | Critical | Platform | Emergency: check if Dispatcher is dead, check DB locks |
| `ConsumerLagHigh` | `histogram_quantile(0.95, rate(event_consume_duration_ms_bucket[5m])) > 5000` | 5min | Warning | Platform | Check consumer business logic, check DB pool |
| `HighRetryRate` | `rate(event_retry_total[5m]) / rate(event_consume_duration_ms_count[5m]) > 0.1` | 10min | Warning | Platform | Review consumer error logs, check for poison messages |

### Database

| Alert Name | Condition | Duration | Severity | Owner | Runbook |
|---|---|---|---|---|---|
| `DBPoolSaturation` | `db_pool_active_connections / 10 > 0.9` | 5min | Critical | Platform | Increase pool size, identify long-running queries |
| `DBSlowQueries` | `histogram_quantile(0.95, rate(db_query_duration_ms_bucket[5m])) > 200` | 5min | Warning | Platform | Run `EXPLAIN ANALYZE`, add indexes, check for missing WHERE |
| `DBPoolWaiting` | `db_pool_waiting_connections > 0` | 2min | Warning | Platform | Pool exhausted; check for connection leaks |

### Redis

| Alert Name | Condition | Duration | Severity | Owner | Runbook |
|---|---|---|---|---|---|
| `RedisCacheHitLow` | `rate(cache_hit_total[5m]) / (rate(cache_hit_total[5m]) + rate(cache_miss_total[5m])) < 0.5` | 10min | Warning | Platform | Review TTL settings, check cache key strategy |
| `RedisMemoryHigh` | Redis `used_memory_rss` / `maxmemory` > 0.9 | 5min | Critical | Platform | Increase `maxmemory`, enable eviction policy |

---

## Alert Testing Protocol

Before promoting to Beta, at least **one alert from each category** (Gateway, Messaging, DB) must be:
1. **Triggered** via a simulated failure scenario.
2. **Received** in the Slack #alerts channel (or equivalent notification target).
3. **Resolved** using the documented runbook steps.
4. **Documented** in the Evidence Package (`docs/reviews/observability-beta/chaos.md`).
