# 0002. Microservices architecture decision

## Status
Accepted

## Context
FoodieGo needs to handle different domains (Identity, Food, Order) that scale independently and have different performance characteristics.

## Decision
Adopt a Microservices Architecture instead of a Monolith.

## Alternatives Considered
- Modular Monolith: Rejected due to the need for independent scaling and isolated failure domains.

## Consequences
- Increased operational complexity.
- Requires robust inter-service communication (RabbitMQ) and API Gateway.
