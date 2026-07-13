# Event Envelope Specification

## Overview
To ensure consistency, traceability, and robust error handling across all microservices, FoodieGo implements a standardized **Event Envelope** pattern. 

All events published to the message broker MUST be wrapped in this envelope. Consumer services rely on the envelope for routing, idempotency, and schema validation. The individual event `payload` can change based on the `eventType`, but the envelope structure is strictly enforced by the Platform Architecture team.

---

## The Standard Envelope

```json
{
  "eventId": "uuid-v4",
  "eventType": "String",
  "aggregateId": "String",
  "aggregateType": "String",
  "occurredAt": "ISO-8601 Timestamp",
  "correlationId": "uuid-v4",
  "traceId": "uuid-v4 (Optional, for Distributed Tracing)",
  "schemaVersion": "String (e.g. v1)",
  "payload": {
    // Dynamic content based on eventType and version
  }
}
```

### Field Definitions

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `eventId` | UUID | **Yes** | A globally unique identifier for this specific event occurrence. Used by consumers as the primary `idempotency_key`. |
| `eventType` | String | **Yes** | The name of the event in PascalCase (e.g., `OrderPendingReservation`). Used by consumers to route the event to the correct handler. |
| `aggregateId` | String | **Yes** | The unique identifier of the domain entity that generated this event (e.g., `order_id`). |
| `aggregateType` | String | **Yes** | The type of the domain entity (e.g., `Order`, `Inventory`). |
| `occurredAt` | Timestamp | **Yes** | UTC timestamp when the state change actually happened in the database (ISO-8601 format). |
| `correlationId` | UUID | **Yes** | Identifier used to group related events across multiple services. For example, all events within a single Saga share the same `correlationId`. |
| `traceId` | UUID | No | The distributed tracing ID originally passed in from the HTTP request headers. Used for observability across service boundaries (e.g. OpenTelemetry). |
| `schemaVersion` | String | **Yes** | The schema version of the `payload` (e.g., `v1`). |
| `payload` | Object | **Yes** | The actual business data related to the event. This must conform to the JSON Schema registered for the given `eventType` and `schemaVersion`. |

---

## Rules

1. **Immutability:** Once an event is published, the envelope and payload are strictly immutable.
2. **Size Limits:** The total size of the JSON (Envelope + Payload) must not exceed 256 KB. For larger payloads, use the "Claim Check" pattern (pass a URL to fetch data).
3. **Validation:** The Publisher Worker MUST validate the envelope structure before sending it to RabbitMQ. If validation fails, the event must be routed to `foodiego.system.dlq`.
4. **Idempotency Execution:** Consumers MUST use `eventId` as the primary key in their local inbox tables to prevent duplicate processing.
