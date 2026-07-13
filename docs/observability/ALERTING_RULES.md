# Payment Service — Alerting Rules

This document defines Prometheus alerting rules for the Payment Service, grouped by severity. SREs should load these rules directly into the Prometheus `rule_files` or Alertmanager.

> **Low Cardinality Rule**: Metric labels must NEVER include `paymentId`, `orderId`, `providerTransactionId`, `traceId`, or `spanId`. Violation will cause Prometheus cardinality explosion.

---

## Severity Levels

| Severity | Impact | Response Time |
|---|---|---|
| **SEV-1** | Complete gateway/service outage | Immediate page — wake on-call |
| **SEV-2** | Elevated error rate or refund failure | Page on-call within 5 minutes |
| **SEV-3** | Dispatcher backlog / slow recovery | Slack alert — acknowledge within 30 minutes |
| **SEV-4** | Manual review queue / soft threshold | Ticket — acknowledge within 4 hours |

---

## SEV-1: Gateway Completely Down

```yaml
- alert: PaymentGatewayDown
  expr: |
    sum(rate(payment_requests_total[5m])) > 0
    and
    sum(rate(payment_timeout_total[5m])) / sum(rate(payment_requests_total[5m])) > 0.95
  for: 2m
  # Recovery: alert auto-resolves when timeout rate drops below 95% for at least 1m
  labels:
    severity: critical
    team: payments
  annotations:
    summary: "Payment gateway appears completely unavailable"
    description: "Over 95% of payment requests are timing out. Gateway may be down."
    runbook: "https://wiki.foodiego.internal/runbooks/payment-gateway-down"
```

---

## SEV-2: Refund Failure Rate Elevated

```yaml
- alert: RefundFailureRateHigh
  expr: |
    rate(payment_refund_failed_total[5m])
    / rate(payment_refund_requests_total[5m]) > 0.05
  for: 3m
  # Recovery: alert auto-resolves when failure rate drops below 5% for at least 1m
  labels:
    severity: high
    team: payments
  annotations:
    summary: "Refund failure rate exceeds 5%"
    description: "{{ $value | humanizePercentage }} of refunds are failing over the last 5 minutes."
    runbook: "https://wiki.foodiego.internal/runbooks/refund-failure"
```

## SEV-2: Availability SLO Breach

```yaml
- alert: PaymentAvailabilitySLOBreach
  expr: |
    (
      rate(payment_refund_success_total[1h])
      / rate(payment_refund_requests_total[1h])
    ) < 0.999
  for: 5m
  # Recovery: alert auto-resolves when 1h availability rises above 99.9% for at least 5m
  labels:
    severity: high
    team: payments
  annotations:
    summary: "Payment service availability dropped below 99.9% SLO"
    description: "Availability is {{ $value | humanizePercentage }} over the last 1 hour."
```

---

## SEV-3: Dispatcher Backlog Stuck

```yaml
- alert: OutboxDispatcherBacklog
  expr: |
    sum(payment_outbox_pending) > 100
  for: 5m
  # Recovery: alert auto-resolves when backlog drops below 100 events
  labels:
    severity: warning
    team: payments
  annotations:
    summary: "Outbox dispatcher backlog > 100 events for 5 minutes"
    description: "Events may not be reaching RabbitMQ. Check dispatcher worker health."
    runbook: "https://wiki.foodiego.internal/runbooks/dispatcher-stuck"
```

## SEV-3: Gateway Timeout Spike

```yaml
- alert: PaymentGatewayTimeoutSpike
  expr: |
    increase(payment_timeout_total[10m]) > 10
  labels:
    severity: warning
    team: payments
  annotations:
    summary: "More than 10 gateway timeouts in the last 10 minutes"
    description: "Gateway may be degraded. Check provider status page."
```

---

## SEV-4: Manual Review Escalation Threshold

```yaml
- alert: ReconciliationEscalationHigh
  expr: |
    increase(payment_reconciliation_escalated_total[1h]) > 5
  # Recovery: alert auto-resolves when the 1h increase window drops to ≤5 (new escalations cease)
  labels:
    severity: info
    team: payments
  annotations:
    summary: "More than 5 payments escalated to manual review in the last hour"
    description: "Unusually high escalation rate. Check reconciliation worker logs and gateway status."
```

## SEV-4: Reconciliation Backlog

```yaml
- alert: ReconciliationBacklogHigh
  expr: |
    count(payments{status=~"UNKNOWN|REFUND_PENDING"}) > 1000
  for: 15m
  labels:
    severity: info
    team: payments
  annotations:
    summary: "Reconciliation backlog > 1000 stuck payments"
    description: "Large number of payments stuck in UNKNOWN/REFUND_PENDING state."
```

---

## Log-Based Alerts (Loki)

The following alerts should be configured in Grafana Loki using LogQL:

```logql
# Alert when ERROR severity appears in payment service
{service="payment-service"} |= "ERROR" | json | severity = "ERROR"
  | rate()[5m] > 5
```

```logql
# Alert on manual review escalation log message
{service="payment-service"} |= "manual review triggered"
```
