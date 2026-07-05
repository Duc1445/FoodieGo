# ADR-001: Why Monorepo

## Context
FoodieGo consists of multiple microservices (Identity, Restaurant, Order) that share configs, types, and infrastructure (Docker, CI/CD).

## Decision
We will use a Monorepo approach with pnpm workspaces.

## Consequences
Easier cross-service refactoring and dependency management. Requires strict CI rules to avoid coupling.
