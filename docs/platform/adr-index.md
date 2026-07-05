# Architecture Decision Record (ADR) Index

## Purpose
Central index of all Architecture Decision Records for the FoodieGo Platform. Organized by Capability for easy audit and traceability.

---

## Index

### Platform — Messaging Capability

| ADR | Title | Status | Date | Link |
|---|---|---|---|---|
| ADR-005 | Message Broker Selection (RabbitMQ) | Approved | 2026-07-05 | [ADR-005](../architecture/decisions/ADR-005-Message-Broker-Selection.md) |
| ADR-006 | Event Versioning Strategy | Approved | 2026-07-05 | [ADR-006](../architecture/decisions/ADR-006-Event-Versioning.md) |
| ADR-007 | Outbox Evolution Roadmap (CDC) | Proposed | 2026-07-05 | [ADR-007](../architecture/decisions/ADR-007-Outbox-Evolution-Roadmap.md) |

### Platform — Observability Capability

| ADR | Title | Status | Date | Link |
|---|---|---|---|---|
| ADR-008 | Observability Stack Selection (Grafana Stack) | Approved | 2026-07-05 | [ADR-008](../architecture/decisions/ADR-008-Observability-Stack-Selection.md) |

### Platform — Security Capability (Future)

| ADR | Title | Status | Date | Link |
|---|---|---|---|---|
| — | Reserved | — | — | — |

### Platform — Identity Capability (Future)

| ADR | Title | Status | Date | Link |
|---|---|---|---|---|
| — | Reserved | — | — | — |

---

## Conventions

1. ADR numbers are globally unique and monotonically increasing.
2. Each ADR must have a `Status`: `Proposed`, `Approved`, `Superseded`, `Deprecated`.
3. When an ADR is superseded, it must link to the new ADR that replaces it.
4. ADRs are immutable once Approved. Changes require a new ADR that supersedes the old one.
5. Every Capability must reference its ADRs in its Capability Specification.
