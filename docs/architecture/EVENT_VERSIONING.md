# Event Versioning Policy

## Overview
As the FoodieGo system evolves, the business requirements for integration events will inevitably change. To prevent breaking changes that could cause consumer services to crash, we enforce a strict **Event Versioning Policy** governed by the Platform Architecture team.

---

## 1. Allowed Changes (Forward/Backward Compatible)

The following changes are considered **safe** and do not require a major version bump. They can be introduced directly into the `v1` schema:

- **Adding an optional field:** Consumers must be designed to ignore fields they do not recognize.
- **Adding a new required field with a default value:** Supported only if the schema validation engine allows injecting default values, otherwise it is considered breaking. For simplicity, prefer adding new fields as optional.

---

## 2. Forbidden Changes (Breaking Changes)

The following changes are **breaking** and MUST result in a version bump (e.g., from `v1` to `v2`):

- **Removing a field:** A field, whether optional or required, must never be removed.
- **Renaming a field:** Causes data loss on the consumer side.
- **Changing the data type of a field:** E.g., changing `amount` from `number` to `string`.
- **Changing an optional field to required.**
- **Adding a new required field without a default value.**

---

## 3. Version Bump Process

When a breaking change is unavoidable:

1. **Create the New Schema:** Define `v2` of the event schema in `packages/contracts/events`.
2. **Publish Both Versions:** The Producer service must update its code to publish BOTH `v1` and `v2` of the event simultaneously, or implement a version translation layer (e.g. `Upcaster`/`Downcaster`).
3. **Migrate Consumers:** Over the next sprint, consumers migrate their logic to listen to `v2` events and drop their bindings to `v1`.
4. **Deprecation:** Once all known consumers have migrated, the `v1` schema is marked as `[DEPRECATED]` in the Event Registry.
5. **Removal:** After a 30-day grace period, the Producer stops publishing `v1` events.

---

## 4. Consumer Resilience Rules

- **Tolerant Reader:** Consumers MUST ignore unknown properties in the JSON payload (`additionalProperties: true` for the envelope, though strict validation may be applied to the `payload` block).
- **Graceful Failure:** If a consumer receives an event it cannot parse, it MUST NOT crash the worker loop. It must route the event to its local DLQ (Dead Letter Queue) and trigger an alert.
