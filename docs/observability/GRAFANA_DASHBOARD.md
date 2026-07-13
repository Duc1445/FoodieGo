# Payment Service — Grafana Dashboard Specification

This document specifies the panels and layout for the Payment Service Grafana dashboard.
The dashboard should be divided into three rows, each targeting a distinct audience.

> **Data Sources**: Prometheus (metrics), Loki (logs), Jaeger/Tempo (traces)

---

## Dashboard Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Row 1 — EXECUTIVE: Business Health & SLO Compliance                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  Row 2 — OPERATIONS: Infrastructure Queues & Worker Health                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Row 3 — ENGINEERS: Latency, Cardinality & Trace Inspection                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Row 1 — Executive

> **Audience**: Engineering leadership, product team
> **Refresh**: 5 minutes
> **Panels**:

| Panel | Type | PromQL |
|---|---|---|
| **Refund Success Rate** | Stat (big number) | `rate(payment_refund_success_total[5m]) / rate(payment_refund_requests_total[5m])` |
| **Availability SLO (99.9%)** | Gauge (0–100%) | `1 - (rate(payment_refund_failed_total[1h]) / rate(payment_refund_requests_total[1h]))` |
| **Error Budget Remaining** | Gauge (decreasing to red) | `(rate(payment_refund_success_total[7d]) / rate(payment_refund_requests_total[7d]) - 0.999) / 0.001 * 100` |
| **Gateway SLA** | Stat | `1 - rate(payment_timeout_total[1h]) / rate(payment_requests_total[1h])` |
| **Payments Authorized (24h)** | Stat | `increase(payment_success_total[24h])` |
| **Refunds Completed (24h)** | Stat | `increase(payment_refund_success_total[24h])` |

---

## Row 2 — Operations

> **Audience**: SRE, on-call engineer
> **Refresh**: 30 seconds
> **Panels**:

| Panel | Type | PromQL / Query |
|---|---|---|
| **Outbox Pending Events** | Time series | `payment_outbox_pending` |
| **Reconciliation Backlog** | Time series | `count(payments{status=~"UNKNOWN\|REFUND_PENDING"})` (Postgres data source) |
| **Manual Review Queue** | Stat (alert red if >0) | `count(payments{manual_review_required="true"})` |
| **Dispatcher Throughput** | Time series | `rate(payment_outbox_publish_duration_seconds_count[1m])` |
| **Reconciliation Escalations** | Time series | `increase(payment_reconciliation_escalated_total[1h])` |
| **Gateway Timeouts** | Time series | `increase(payment_timeout_total[5m])` |

---

## Row 3 — Engineers

> **Audience**: Backend engineers
> **Refresh**: 1 minute
> **Panels**:

| Panel | Type | PromQL |
|---|---|---|
| **Gateway Refund Latency (P50/P95/P99)** | Time series | `histogram_quantile(0.99, sum(rate(payment_gateway_request_duration_seconds_bucket{operation="refund"}[5m])) by (le))` |
| **Webhook Processing Latency (P99)** | Time series | `histogram_quantile(0.99, sum(rate(payment_webhook_processing_duration_seconds_bucket[5m])) by (le))` |
| **Dispatcher Publish Latency (P99)** | Time series | `histogram_quantile(0.99, sum(rate(payment_outbox_publish_duration_seconds_bucket[5m])) by (le))` |
| **Reconciliation Batch Duration (P95)** | Time series | `histogram_quantile(0.95, sum(rate(payment_reconciliation_duration_seconds_bucket[10m])) by (le))` |
| **Retry Distribution** | Bar chart | `increase(payment_retry_total[1h])` |
| **Webhook Throughput** | Time series | `rate(payment_webhook_duplicate_total[5m])` vs `rate(payment_signature_failed_total[5m])` |
| **Reconciliation Outcomes** | Pie chart | `sum(increase(payment_reconciliation_total[1h])) by (outcome)` |
| **Logs Panel** | Loki logs | `{service="payment-service"} \| severity = "ERROR"` |

---

## Alerts Panel

A dedicated Grafana Alerting panel should display all firing alerts from the rules in `ALERTING_RULES.md`, filtered by `team=payments`.

---

## Variable Filters

The dashboard should include the following Grafana template variables:

| Variable | Type | Values |
|---|---|---|
| `$gateway` | Constant / Multi-value | `mock`, `stripe`, `paypal` |
| `$operation` | Multi-value | `authorize`, `refund`, `query` |
| `$interval` | Interval | `5m`, `15m`, `1h` |
