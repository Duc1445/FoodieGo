# Platform Readiness Checklist

## Purpose
This is an **operational checklist** — not a code checklist. It is used by SREs and on-call engineers to verify that the Observability Platform is correctly deployed and functioning in any environment.

---

## Pre-Deployment Checklist

| # | Item | Verify | Status |
|---|---|---|---|
| 1 | **Tracing Enabled** | `OTEL_ENABLED` ≠ `false` in service env | ⏳ |
| 2 | **Metrics Enabled** | `METRIC_ENABLED` ≠ `false` in service env | ⏳ |
| 3 | **Logging Enabled** | `LOG_LEVEL` set appropriately (`info` for prod) | ⏳ |
| 4 | **Sampling Configured** | `OTEL_SAMPLING_RATIO` set (0.05 for prod, 1.0 for dev) | ⏳ |
| 5 | **PII Redaction Active** | Built-in to `@foodiego/logging` — always on | ✅ |
| 6 | **Service Resource Attributes** | `SERVICE_NAME`, `SERVICE_VERSION`, `DEPLOYMENT_ENVIRONMENT` set in env | ⏳ |
| 7 | **Tempo Reachable** | `OTEL_EXPORTER_OTLP_ENDPOINT` points to running Tempo instance | ⏳ |
| 8 | **Prometheus Scraping** | All services listed in `prometheus.yml` scrape config | ✅ |
| 9 | **Loki Receiving** | Services stdout → Loki ingestion pipeline active | ⏳ |
| 10 | **Grafana Datasources** | Prometheus, Loki, Tempo datasources provisioned | ✅ |

## Post-Deployment Verification

| # | Item | Verify | Status |
|---|---|---|---|
| 11 | **Health Endpoints** | `GET /health` returns 200 on all services | ⏳ |
| 12 | **Metrics Endpoints** | `GET /metrics` returns Prometheus format on all services | ⏳ |
| 13 | **Trace Appears in Tempo** | Make an API call → find trace in Grafana Explore → Tempo | ⏳ |
| 14 | **Log Appears in Loki** | Same API call → find log in Grafana Explore → Loki with traceId | ⏳ |
| 15 | **Dashboards Loaded** | Open Grafana → Platform folder → dashboards visible | ⏳ |
| 16 | **Alert Rule Active** | At least 1 alert per category configured in Grafana/Alertmanager | ⏳ |
| 17 | **Runbook Accessible** | `docs/reviews/observability-beta/operations.md` exists and current | ✅ |

## Emergency Procedures

| Scenario | Action |
|---|---|
| Telemetry causing latency | Set `OTEL_ENABLED=false`, restart service |
| Metrics causing memory issues | Set `METRIC_ENABLED=false`, restart service |
| Logs too verbose | Set `LOG_LEVEL=error`, restart service |
| Tempo down | No action needed — tracing is fire-and-forget, no app impact |
| Prometheus down | Metrics stop being scraped; no app impact |
