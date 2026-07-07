# 004 Webhook Idempotency

## Status
Accepted

## Context
When integrating with real Payment Gateways (e.g., Stripe, VNPay, Adyen), state changes are delivered asynchronously via Webhooks. These systems often employ retry mechanisms when they do not receive a prompt 2xx acknowledgment, which can lead to the same webhook payload being delivered multiple times. Duplicate processing of payment success or failure events can lead to double-dispatching outbox events and data inconsistency. Furthermore, processing business logic synchronously within the HTTP handler of the webhook increases the risk of network timeouts from the Gateway's perspective, exacerbating the duplication issue.

## Decision
We will employ a robust idempotency and zero-trust strategy for handling webhooks:
1. **Inbox Pattern for Idempotency**: All incoming webhooks will first have their unique `webhook_id` (e.g., Stripe's `event.id`) recorded in the `inbox_events` table within a transaction. The `ON CONFLICT DO NOTHING` database constraint ensures that any duplicate `webhook_id` will be immediately identified, allowing the system to safely skip processing and return a 200 OK.
2. **Zero-trust Verification First**: Before any database interaction, the webhook's raw body HMAC signature and X-Timestamp must be validated. If validation fails, the system returns a 403 Forbidden.
3. **Prompt 200 OK**: The HTTP response must be sent as quickly as possible. Currently, our business logic is lightweight enough to run within the same request lifecycle (saving to DB and Outbox), but by ensuring idempotency at the database level, even if the processing takes slightly longer and the gateway retries, the duplicate will be harmless.

## Consequences
- **Pros**: Guarantees exactly-once processing of payment outcomes. Prevents replay attacks via timestamp verification. Avoids double-dispatch of `PaymentSucceeded` to the Order Service.
- **Cons**: Requires strict handling of raw HTTP bodies across the Express middleware stack to correctly compute HMAC signatures.
