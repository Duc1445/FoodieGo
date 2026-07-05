# Trace Quality KPIs

## Purpose
Not all traces are equal. A trace that is incomplete, broken, or missing parent context is worse than no trace at all — it creates false confidence. This document defines measurable KPIs for trace quality that the Platform team monitors continuously.

---

## KPI Definitions

| KPI | Definition | Target | Measurement Method |
|---|---|---|---|
| **Trace Completeness** | % of traces that start at the Gateway and end at the final DB operation or Consumer ACK | ≥ 99% | Sample 100 traces/day, verify each has root span (Gateway) and leaf span (DB/Consumer) |
| **Broken Trace Rate** | % of spans with a `parentSpanId` that references a non-existent span | < 0.5% | Query Tempo for spans where parent lookup fails |
| **Orphan Span Rate** | % of spans that have no parent AND are not a root span | 0% | Query Tempo for spans without `parentSpanId` that are not tagged as root |
| **Missing Parent Rate** | % of Consumer spans that cannot be linked to their Publisher span via `traceparent` | 0% | Verify AMQP header propagation by sampling consumed messages |
| **Context Propagation Coverage** | % of inter-service calls (HTTP + AMQP) that carry valid `traceparent` headers | 100% | Middleware audit: log warning if incoming request has no `traceparent` |
| **Error Span Accuracy** | % of HTTP 5xx / Consumer failures that have corresponding `span.setStatus(ERROR)` + `span.recordException()` | 100% | Compare error log count in Loki with error span count in Tempo |

---

## Measurement Process

### Daily (Automated)
- **Backlog check**: `dispatcher_backlog` gauge should correlate with `outbox_events` PENDING count.
- **Duplicate check**: `inbox_duplicate_total` should be near zero under normal conditions.

### Weekly (Manual Sampling)
- Pick 10 random traces from Tempo.
- For each trace, verify:
  1. Root span exists (Gateway HTTP request).
  2. All intermediate spans are connected (no gaps).
  3. Leaf span exists (DB query or Consumer ACK).
  4. Error spans have `recordException` attached.

### On Each Release
- Run the E2E verification flow:
  ```
  Gateway → Restaurant → Order → Outbox → Dispatcher → RabbitMQ → Consumer → DB
  ```
- Verify the entire flow appears as **one trace** in Tempo.
- Verify "View Logs" from Tempo opens Loki with matching `traceId`.

---

## Remediation

| Issue | Root Cause | Fix |
|---|---|---|
| Broken trace | Service not initializing `@foodiego/tracing` before Express | Ensure `initTracing()` is the first import |
| Orphan span | Manual span created outside of an active context | Use `withSpan()` which always uses `context.active()` |
| Missing parent in Consumer | AMQP message missing `traceparent` header | Verify `RabbitMQAdapter.publish()` injects `propagation.inject()` |
| Error span without `recordException` | Developer used `console.error` instead of span API | Code review + Trace Style Guide enforcement |

---

## Dashboard Panel (Planned)

A dedicated "Trace Quality" panel should be added to the Platform Overview dashboard showing:
- Trace completeness % (7-day rolling)
- Broken trace count (daily)
- Orphan span count (daily)
- Error span accuracy % (7-day rolling)
