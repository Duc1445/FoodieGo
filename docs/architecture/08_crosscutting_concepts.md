# 8. Cross-cutting Concepts

- **Authentication**: Handled by Identity Service issuing JWTs. Gateway forwards headers.
- **Observability**: Prometheus, Grafana, Loki, Tempo.
- **Idempotency**: Critical APIs (like Checkout) require an `Idempotency-Key` to prevent duplicate transactions.
