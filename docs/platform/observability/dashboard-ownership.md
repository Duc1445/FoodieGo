# Dashboard Ownership Registry

## Purpose
Every Grafana dashboard is a **Platform artifact** with a designated owner, SLO alignment, and review cadence. This prevents dashboard sprawl and ensures dashboards remain accurate as the system evolves.

---

## Registry

| Dashboard | UID | Owner | SLO Alignment | Review Cadence |
|---|---|---|---|---|
| Platform Overview | `foodiego-overview` | Platform Team | Gateway Availability 99.9%, Latency P95 < 200ms | Quarterly |
| Messaging Runtime | `foodiego-messaging` | Platform Team | Dispatch latency < 500ms, DLQ rate < 0.1% | Quarterly |
| Gateway | `foodiego-gateway` (planned) | Platform Team | Availability 99.9%, Error rate < 0.1% | Quarterly |
| Restaurant Service | `foodiego-restaurant` (planned) | Restaurant Team | Latency P95 < 150ms | Quarterly |
| Order Service | `foodiego-order` (planned) | Order Team | Checkout success rate > 99% | Quarterly |
| PostgreSQL | `foodiego-postgres` (planned) | Platform Team | Pool saturation < 80%, Slow query < 1% | Monthly |
| Redis | `foodiego-redis` (planned) | Platform Team | Hit ratio > 80%, Memory < 80% | Monthly |

---

## Rules

1. **Every dashboard must have an owner.** Orphan dashboards will be archived after 2 sprints.
2. **Owners are responsible for**:
   - Ensuring panels reflect current metrics (no stale/broken queries).
   - Updating the dashboard when metrics are deprecated or renamed (per Metric Catalog).
   - Reviewing the dashboard at the cadence specified above.
3. **Dashboard changes** must be committed as JSON to `infrastructure/grafana/dashboards/`. Manual Grafana UI changes will be overwritten on the next deployment.
4. **SLO alignment**: Each dashboard must clearly display its associated SLO target. Panels should include threshold markers (green/yellow/red) aligned with the SLO.
5. **New dashboards** require a PR that updates this registry.
