# Architecture Review Report

## Current Strengths
- **Clear Microservice Boundaries**: The backend is well-partitioned into Identity, Restaurant, Food, Order, Inventory, and Payment services.
- **Frontend Architecture**: The separation of API, Store (Zustand), and Presentation layers is well-maintained. The \`pricing.ts\` utility is pure and decoupled from the service layer.
- **Backend as Source of Truth**: Sprint 2B successfully migrated the local cart to a backend-synced cart using pessimistic UI/optimistic locking where necessary.

## Issues Found
- **Duplicate Documentation**: The legacy files \`SYSTEM_CONTEXT.md\`, \`ARCHITECTURE.md\`, and \`DATABASE_SCHEMA.md\` at the project root duplicate the newer arc42 documentation found in \`docs/architecture/\`. This violates the DRY principle for docs and risks causing contradicting architectures.
- **AI Rule Duplication**: The "Before frontend work", "Before backend work", and "Feature development workflow" rules are scattered inconsistently across \`AGENTS.md\` and \`DEVELOPMENT_RULES.md\`.

## Recommended Changes
1. **Remove Legacy Docs**: Delete \`SYSTEM_CONTEXT.md\`, \`ARCHITECTURE.md\`, and \`DATABASE_SCHEMA.md\` from the root.
2. **Consolidate AI Workflows**: Centralize AI rules into \`AGENTS.md\` and keep \`DEVELOPMENT_RULES.md\` purely for human engineering standards.

## Priority
- **P0**: Remove legacy architecture docs to prevent AI agent confusion (Critical documentation inconsistency).
- **P1**: Consolidate AI rules before next MVP sprint.
- **P2**: Implement strict E2E testing for the Checkout flow to guarantee cross-service transaction safety.
