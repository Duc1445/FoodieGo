# 0004. Database ownership per service

## Status
Accepted

## Context
To ensure loose coupling, microservices should not share databases.

## Decision
Each microservice owns its own database or schema. Direct database access from another service is strictly forbidden.

## Consequences
- Data duplication is sometimes necessary (eventual consistency).
- Enhances isolation and reliability.
