# 0003. Monorepo architecture decision

## Status
Accepted

## Context
Multiple frontends, shared packages, and multiple backend microservices.

## Decision
Use a Monorepo managed by `pnpm` workspaces.

## Alternatives Considered
- Multi-repo: Rejected due to difficulty in sharing UI packages and typescript configs.

## Consequences
- Easier code sharing and synchronized deployments.
- Requires strict dependency management to prevent cross-service coupling.
