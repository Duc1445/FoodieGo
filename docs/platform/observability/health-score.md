# Observability Health Score

## Purpose
A single composite score (0–100) that summarizes the operational health of the Observability Capability. Used in release reviews and capability promotion decisions.

---

## Scoring Formula

| Category | Weight | Criteria | Max Points |
|---|---|---|---|
| **Trace Continuity** | 30% | E2E trace completeness ≥99%, Broken trace <0.5%, Orphan span = 0% | 30 |
| **Metrics Completeness** | 20% | All Golden Signals emitting, no unregistered metrics, no high-cardinality labels | 20 |
| **Alert Readiness** | 20% | All 14 alert rules defined, ≥1 per category tested, runbook exists for each | 20 |
| **Logging Quality** | 15% | PII redaction active, JSON format, traceId correlation working, log levels correct | 15 |
| **Dashboard Coverage** | 15% | All dashboards provisioned, all have owners, SLO thresholds visible | 15 |

---

## Current Score

| Category | Score | Notes |
|---|---|---|
| Trace Continuity | 25/30 | Architecture guarantees in place; pending E2E runtime verification |
| Metrics Completeness | 18/20 | All metrics registered in catalog; DB pool metrics pending runtime |
| Alert Readiness | 12/20 | Rules defined; testing pending runtime |
| Logging Quality | 14/15 | PII redaction built-in; trace correlation pending runtime |
| Dashboard Coverage | 13/15 | Overview + Messaging dashboards provisioned; per-service dashboards planned |

### **Overall: 82/100** (Pre-Beta)

> Target for Beta promotion: **≥ 90/100**
> Target for Stable: **≥ 95/100**

---

## Score History

| Date | Score | Phase | Notes |
|---|---|---|---|
| 2026-07-05 | 82 | Internal → Beta Prep | Governance complete, runtime pending |

*Updated after each phase transition.*
