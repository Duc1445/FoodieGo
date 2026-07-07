# ADR 005: Zero-Trust Webhook Inbox Pattern

## Status
Accepted

## Context
When implementing external asynchronous webhooks for our Payment Gateway integration, we face multiple security and reliability challenges:
1. **Security (Zero Trust):** We cannot trust incoming HTTP requests unless they can prove their authenticity. Signatures might be invalid, or requests might be replayed.
2. **Reliability & Idempotency:** The external gateway can send the same webhook multiple times (due to network retries) or out-of-order. If we process the business logic inline within the HTTP request, any failure (e.g., database lock timeout, RabbitMQ disconnect) would cause us to return a 500 error to the gateway, forcing a retry.

## Decision
We decided to adopt the **Webhook Inbox Pattern** with **Zero-Trust principles**.
1. **HTTP Controller Validation:** The Express route (`WebhookController`) uses `express.raw` to compute the HMAC SHA256 of the exact received body and compares it against the `x-signature` header. It also validates the `x-timestamp` header against a maximum 5-minute clock drift to mitigate replay attacks.
2. **Immediate Persistence (Inbox):** Once validated, the raw payload, signature, and metadata are immediately inserted into a dedicated `webhook_inbox` table with a status of `PENDING`. The `event_id` serves as a `UNIQUE` constraint. Duplicate webhooks are gracefully ignored using `ON CONFLICT DO NOTHING`.
3. **Early Acknowledgment:** The HTTP route immediately returns `200 OK` to the Gateway, freeing up HTTP connections and preventing Gateway retries.
4. **Asynchronous Business Processing:** A separate background worker (`WebhookWorker`) polls the `webhook_inbox` table, reads the raw payload, performs the actual state transition in the `payments` table, and publishes the Outbox event in a single atomic database transaction.

## Consequences
- **Positive:** Maximum reliability and throughput. The gateway is never blocked by our internal business logic or downstream RabbitMQ availability. Security is enforced at the edge. True idempotency is achieved via database constraints.
- **Negative:** Increased latency between receiving the webhook and updating the payment status (by a few milliseconds due to polling). We require an additional database table (`webhook_inbox`) and worker process.
