# ADR 004: Asynchronous Webhook Confirmation for Payments

## Status
Accepted

## Context
In early sprints, the Payment Service utilized a synchronous mock gateway simulation where `setTimeout` was used to delay the payment processing. While this simulated latency, it was not representative of real-world external payment gateways (such as Stripe, Adyen, VNPay). In a real environment, the payment request is immediately responded to with a `PENDING` state, and the final status is communicated asynchronously via an HTTP webhook callback from the gateway. Using synchronous `setTimeout` makes our system vulnerable to process restarts (losing the timer) and doesn't test the complex web of network, infrastructure, and state-machine problems that webhooks introduce.

## Decision
We decided to adopt an **Asynchronous Webhook Confirmation Pattern**.
1. **Synchronous PENDING:** When the `payment-service` calls `Gateway.authorize()`, it immediately persists a `PENDING` status to the database.
2. **Background Worker Mock:** The `MockGateway` now persists a job into a `mock_gateway_jobs` database table. A separate `MockGatewayWorker` polls this table and executes an HTTP POST to `http://localhost:3005/webhook/payment` to simulate the external gateway sending an asynchronous callback.
3. **Webhook Callback:** The `payment-service` exposes an `express.raw` endpoint to receive the webhook, validating the signature and timestamp.

## Consequences
- **Positive:** We closely mimic a production-grade external payment gateway integration. The system's resilience to external failures, delays, and out-of-order deliveries can be properly tested. Process restarts do not result in lost payment callbacks.
- **Negative:** Increased complexity in the `payment-service`. The gateway interactions are now split across synchronous requests and asynchronous listener endpoints, which require their own background workers, persistence logic, and rigorous testing for idempotency and signature validation.
