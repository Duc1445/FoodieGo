# ADR-003: Zero-Trust Async Webhooks

**Date:** 2026-07-06
**Status:** Accepted

## Context
Payment gateways typically notify applications of payment success, failure, or disputes via asynchronous HTTP Webhooks. Trusting these webhooks blindly can lead to severe security vulnerabilities, including fraudulent successful payments, replay attacks, and race conditions.

## Decision
We will implement a "Zero-Trust" Webhook processing model. The webhook endpoint will only perform validation and persistence, deferring business logic to background workers.

The strict flow is:
1. Receive Request
2. Verify Signature
3. Verify Timestamp
4. Persist to Inbox (using Webhook ID as `idempotency_key`)
5. Return `200 OK`
6. Background processing of the payload

## Alternatives
- **Synchronous Processing:** Process the payment state change before returning `200 OK`. Rejected because it can cause timeouts on the gateway side, leading to retries and race conditions.
- **Unverified Endpoints:** Rejected due to obvious security risks.

## Consequences
- **Positive:** Extremely robust against replay attacks, duplicate webhooks, and gateway timeouts.
- **Positive:** Highly performant endpoint.
- **Negative:** Slight delay between webhook receipt and system state update (eventual consistency).
