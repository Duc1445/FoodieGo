# Payment Service — Service Level Objectives (SLOs)

This document defines the SLOs for the Payment Service. These SLOs are binding operational commitments and should be monitored continuously via the Grafana dashboard.

## Definitions

| Term | Definition |
|---|---|
| **SLI** | Service Level Indicator — a specific measurement (e.g., % refunds completed in <2m) |
| **SLO** | Service Level Objective — the target threshold (e.g., 99%) |
| **Error Budget** | `100% - SLO` — the allowable failure margin before feature releases are frozen |
| **SLA** | Service Level Agreement — external contractual commitment (not in scope here) |

## SLO Table

| Flow | SLI | SLO | Error Budget | Alert Threshold |
|---|---|---|---|---|
| **Refund (Success Rate)** | `rate(payment_refund_success_total) / rate(payment_refund_requests_total)` | **99.5%** | **0.5%** | Alert when budget > 50% consumed in rolling 24h |
| **Refund (Latency P99)** | 99th percentile of `payment_gateway_request_duration_seconds{operation="refund"}` | **< 2 minutes** | — | Alert when P99 > 90s |
| **Webhook (Latency P99)** | 99th percentile of `payment_webhook_processing_duration_seconds` | **< 500ms** | — | Alert when P99 > 300ms |
| **Dispatcher (Latency P99)** | 99th percentile of `payment_outbox_publish_duration_seconds` | **< 5s** | — | Alert when P99 > 3s |
| **Reconciliation (Success Rate)** | `rate(reconciliation{outcome="resolved"}) / rate(reconciliation_total)` | **95%** | **5%** | Alert when budget > 50% consumed |
| **Reconciliation (Latency P95)** | 95th percentile of `payment_reconciliation_duration_seconds` | **< 30 minutes** | — | Alert when P95 > 20m |
| **Overall Availability** | `1 - rate(payment_refund_failed_total) / rate(payment_refund_requests_total)` | **99.9%** | **0.1%** | Alert when availability drops below 99.9% |

## Error Budget Policy

When the Error Budget for Refund Success Rate or Availability is **exhausted** (100% of budget consumed):

1. **Freeze** all non-critical feature releases.
2. **Escalate** to on-call SRE with full incident report.
3. **Post-mortem** required within 48 hours.
4. Feature releases resume only after the budget is **restored above 50%** for 7 consecutive days.

## PromQL Examples

```promql
# Refund success rate (5m window)
rate(payment_refund_success_total[5m])
  / rate(payment_refund_requests_total[5m])

# Webhook P99 latency
histogram_quantile(0.99,
  sum(rate(payment_webhook_processing_duration_seconds_bucket[5m])) by (le)
)

# Dispatcher P99 latency
histogram_quantile(0.99,
  sum(rate(payment_outbox_publish_duration_seconds_bucket[5m])) by (le)
)

# Gateway refund P99 latency
histogram_quantile(0.99,
  sum(rate(payment_gateway_request_duration_seconds_bucket{operation="refund"}[5m])) by (le)
)

# Reconciliation P95 duration
histogram_quantile(0.95,
  sum(rate(payment_reconciliation_duration_seconds_bucket[10m])) by (le)
)
```
