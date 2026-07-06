# ADR-001: Use PaymentRequested Event Instead of OrderReadyForPayment State

**Date:** 2026-07-06
**Status:** Accepted

## Context
When an order's inventory is successfully reserved, the Saga needs to proceed to the payment phase. We initially considered publishing an event named `OrderReadyForPayment` to reflect the new state of the Order aggregate.

## Decision
We decided to publish a `PaymentRequested` event (with `eventVersion: 1`) instead of `OrderReadyForPayment`.

## Alternatives
1. Publish `OrderReadyForPayment` (State-driven). This couples the Payment Service to the concept of Order states.
2. Synchronous REST/gRPC call. This breaks the Saga pattern and introduces tight coupling.

## Consequences
- **Positive:** The event expresses a clear business intention (Command/Integration Event) rather than a state notification. It aligns with Domain-Driven Design (DDD).
- **Positive:** Future evolution of the Payment Service is decoupled from Order state nomenclature.
- **Negative:** None.
