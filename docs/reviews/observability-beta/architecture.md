# Observability Foundation — Beta Evidence: Architecture

## Capability Architecture

```mermaid
graph TB
    subgraph "Application Layer"
        GW["Gateway"]
        RS["Restaurant Service"]
        OS["Order Service"]
    end
    
    subgraph "Platform SDK Layer"
        T["@foodiego/tracing v1.0.0"]
        M["@foodiego/metrics v1.0.0"]
        L["@foodiego/logging v1.0.0"]
    end
    
    subgraph "Infrastructure Layer"
        TEMPO["Grafana Tempo"]
        PROM["Prometheus"]
        LOKI["Grafana Loki"]
        GRAF["Grafana"]
    end
    
    subgraph "Messaging"
        RMQ["RabbitMQ"]
        DISP["Outbox Dispatcher"]
    end
    
    GW --> T & M & L
    RS --> T & M & L
    OS --> T & M & L
    DISP --> T
    
    T -->|OTLP gRPC| TEMPO
    M -->|scrape /metrics| PROM
    L -->|JSON stdout| LOKI
    
    TEMPO --> GRAF
    PROM --> GRAF
    LOKI --> GRAF
    
    GRAF -->|trace-to-log| LOKI
```

## Context Propagation Flow

```mermaid
sequenceDiagram
    participant Client
    participant GW as Gateway
    participant RS as Restaurant Service
    participant OS as Order Service
    participant PG as PostgreSQL
    participant DISP as Dispatcher
    participant RMQ as RabbitMQ
    participant CON as Consumer

    Client->>GW: HTTP (no traceparent)
    Note over GW: Root Span created
    GW->>RS: HTTP + traceparent
    Note over RS: Child Span (auto)
    RS->>PG: SQL Query
    Note over PG: Child Span (auto-pg)
    RS-->>GW: Response
    GW->>OS: HTTP + traceparent
    Note over OS: Child Span (auto)
    OS->>PG: INSERT order + outbox_events
    Note over PG: Child Span (auto-pg)
    OS-->>GW: Response
    GW-->>Client: Response

    Note over DISP: Poll outbox_events
    DISP->>RMQ: Publish + inject traceparent into AMQP headers
    RMQ->>CON: Deliver message
    Note over CON: Extract traceparent → child span
    CON->>PG: INSERT inbox + business logic
    Note over PG: Child Span (auto-pg)
```

## Key Design Decisions

| Decision | Rationale |
|---|---|
| W3C `traceparent` for all boundaries | Industry standard, vendor neutral |
| Pino + OTel mixin for logging | Auto-inject traceId without developer effort |
| MetricsRegistry (centralized) | Prevent ad-hoc metric creation and high cardinality |
| PII Redaction in SDK | Defense in depth — never trust developers to remember |
| Cost toggles (ENV) | Allow disabling telemetry without redeployment |
| Dashboard as Code (JSON) | Reproducible, version-controlled, no manual UI changes |
