# Observability Foundation — Beta Evidence: Alert Rules

## Alert Rules Summary

All rules are defined in [docs/platform/observability/alert-rules.md](../../platform/observability/alert-rules.md).

### Coverage Verification

| Category | Alert Count | Tested |
|---|---|---|
| Gateway | 4 (ErrorRate, HighLatency, LatencyCritical, TrafficDrop) | ⏳ Pending runtime |
| Messaging | 5 (DLQThreshold, BacklogHigh, BacklogCritical, ConsumerLag, RetryRate) | ⏳ Pending runtime |
| Database | 3 (PoolSaturation, SlowQueries, PoolWaiting) | ⏳ Pending runtime |
| Redis | 2 (CacheHitLow, MemoryHigh) | ⏳ Pending runtime |

### Testing Protocol (Beta Exit Criteria)

For Beta promotion, at least **one alert per category** must be:

1. **Triggered** — via simulated failure
2. **Received** — in notification channel
3. **Resolved** — using runbook steps
4. **Documented** — in this evidence package

### Planned Test Scenarios

| Alert | Trigger Method | Expected Result |
|---|---|---|
| `GatewayHighErrorRate` | Kill Order Service while Gateway is proxying | Error rate spikes > 1%, alert fires within 5min |
| `DLQThresholdExceeded` | Deploy consumer with intentional bug → events exhaust retries | `dead_letter_events` count > 50, alert fires immediately |
| `DBPoolSaturation` | Open 9 long-running transactions on a pool of 10 | `db_pool_active_connections` > 90%, alert fires |

> **Note**: These tests require the full Docker Compose stack running. Results will be appended here after execution.
