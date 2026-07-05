# ADR-002: Why Layered DDD (Hybrid)

## Context
Express projects can become messy with just Model-Route-Controller.

## Decision
Adopt Layered DDD (Controller -> Service -> Repository -> Entity) instead of full Clean Architecture to balance structure and simplicity.

## Consequences
Separates business logic from routing, making testing easier without over-engineering.
