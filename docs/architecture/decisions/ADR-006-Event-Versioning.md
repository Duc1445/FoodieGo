# ADR 006: Event Versioning Strategy

## Status
Approved

## Context
As the FoodieGo platform evolves, the payload of domain events (e.g., `OrderCreated`) will inevitably change. We need a strict versioning strategy to ensure that legacy consumers do not break when new fields are added, and that new consumers can handle older events during migration periods or replays.

## Decision
We adopt **Schema Evolution with Backward Compatibility (Append-Only Fields)** as our primary versioning strategy.

### Rules:
1. **Never Remove or Rename Fields**: Existing fields in an event payload must never be removed or renamed. If a field is deprecated, it remains in the payload but may be set to `null` (if nullable) or a default value.
2. **Append-Only**: New features must be added as new fields.
3. **Explicit Versioning**: The `EventEnvelope` has a `version` field. When a breaking change is absolutely unavoidable, the version number is incremented (e.g., `OrderCreated` v1 -> `OrderCreated` v2).
4. **Parallel Publishing**: During a breaking change transition, the Publisher must publish BOTH v1 and v2 events to allow old consumers time to migrate.
5. **Consumer Responsibility**: Consumers must ignore unknown fields (Robustness Principle: "Be conservative in what you send, be liberal in what you accept").

## Consequences
- Requires strict code reviews on Event classes.
- Payload sizes may grow over time due to deprecated fields.
- Allows decoupled deployment of Publishers and Consumers.
