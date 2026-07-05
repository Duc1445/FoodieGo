# ADR 008: Observability Stack Selection

## Status
Approved

## Context
FoodieGo needs a full observability stack for distributed tracing, metrics, and centralized logging across all microservices. The stack must be open-source, self-hostable for development, and compatible with cloud-managed solutions in production.

## Options Considered

### Tracing
| Criteria | Jaeger | Grafana Tempo |
|---|---|---|
| Storage | Requires Elasticsearch/Cassandra | Object storage / Local FS |
| Complexity | High (multi-component) | Low (single binary) |
| Query | Jaeger UI (separate) | Grafana native (unified) |
| OTel Support | Full | Full |
| Cost | High storage cost at scale | Minimal (index-free) |

### Logging
| Criteria | ELK Stack | Grafana Loki |
|---|---|---|
| Storage | Elasticsearch (heavy) | Object storage (lightweight) |
| Indexing | Full-text index (expensive) | Label-based (cheap) |
| Query | KQL | LogQL |
| Integration | Kibana (separate UI) | Grafana native (unified) |

### Metrics
Prometheus is the industry standard. No alternatives were seriously considered.

## Decision
We select the **Grafana Stack**: Prometheus + Loki + Tempo + Grafana.

### Rationale
1. **Unified UI**: All three signals (metrics, logs, traces) in a single Grafana instance.
2. **Trace-to-Log correlation**: Grafana natively links Tempo traces to Loki logs via `traceId`.
3. **Low operational cost**: Tempo and Loki are designed to be lightweight.
4. **OTel native**: All components support OpenTelemetry Protocol (OTLP).
5. **Cloud-portable**: Grafana Cloud offers managed versions for production.

## Consequences
- Teams must learn LogQL for log queries.
- Tempo has no search-by-attribute (must search by traceId or use Grafana's TraceQL).
- Long-term retention requires object storage (S3/GCS) configuration.
