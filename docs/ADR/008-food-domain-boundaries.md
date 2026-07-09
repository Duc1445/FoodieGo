# ADR 008: Food Domain Boundaries

## Status
Accepted

## Context
As the FoodieGo platform expands, we need to decide whether the catalog management (Menu, Categories, Food Items, Options) belongs within the existing `restaurant-service` or warrants a dedicated `food-service`. The `restaurant-service` currently handles restaurant onboarding, merchant identity, payouts, and business profiles. The catalog management handles highly structured entity hierarchies, complex search queries, geospatial and AI-vector search integrations, and high-read throughput.

## Decision
We will extract the catalog domain into a dedicated **Food Service** (`apps/food-service`).

## Ownership
- **Restaurant Service**: Owns Merchant Lifecycle, Restaurant Business Profile, Operating Hours, Payouts, Verification.
- **Food Service**: Owns Menus, Categories, Food Items, Variants, Option Groups, and Search Projections.

## Aggregates in Food Service
- `FoodAggregate`: Root entity for Food items. Contains `Variant` and `OptionGroup` entities. References media via `mediaIds` (Media is an external bounded context).
- `CategoryAggregate`: Hierarchical category management.
- `MenuAggregate`: Groups categories and food items, enforcing availability schedules.

## Events
- Aggregates emit versionless **Domain Events** (e.g., `FoodCreated`).
- The `IntegrationEventMapper` translates Domain Events into versioned **Integration Events** (e.g., `FoodCreatedV1`) wrapping them in a standard Envelope.
- Outbox pattern is strictly used to publish integration events reliably.

## Trade-offs
- **Pros**: 
  - Independent scaling of the highly read-heavy search and catalog API.
  - Separation of concerns: restaurant onboarding lifecycle vs menu management lifecycle.
  - Easier isolation of complex AI vector embeddings and spatial projections from basic merchant CRUD.
- **Cons**:
  - Increased complexity in deployment.
  - Cross-service communication required when a restaurant is created/deleted.
