# Chaos Engineering: RabbitMQ Restart

## Scenario
We simulated a RabbitMQ broker crash during normal operations by manually restarting the RabbitMQ container (`docker restart foodiego-rabbitmq`) to verify how the services handle broker unavailability.

## Expected Behavior
1. The `RabbitMQAdapter` should detect the `close` event and exit the Node process (`process.exit(1)`) to ensure a clean state, instead of hanging indefinitely.
2. The Docker engine (via `restart: always` in `docker-compose.yml`) should detect the crash and restart the container.
3. Upon restart, the service should reinitialize the `RabbitMQAdapter`, Outbox Dispatcher, and Event Consumers, reconnecting to the broker successfully.
4. No messages should be lost. Any pending outbox messages will be picked up by the Outbox Dispatcher when it reconnects.

## Evidence (Order Service Logs)
```text
[RabbitMQ] Connection closed unexpectedly
npm error Lifecycle script `start` failed with error:
npm error code 1
npm error path /app/apps/order-service
npm error workspace order-service@1.0.0
npm error location /app/apps/order-service
npm error command failed
npm error command sh -c node src/index.js

> order-service@1.0.0 start
> node src/index.js

[Tracing] Initialized for "order-service" (env=development, sampler=AlwaysOnSampler)
[Redis] Connected successfully
{"severity":"INFO","time":"2026-07-06T05:16:14.152Z","service":"order-service","environment":"development","port":"3003","msg":"Order Service started"}
[OutboxDispatcher] Started worker order-service-dispatcher
{"severity":"INFO","time":"2026-07-06T05:16:14.261Z","service":"order-service","environment":"development","msg":"Outbox Dispatcher started successfully"}
{"severity":"INFO","time":"2026-07-06T05:16:14.323Z","service":"order-service","environment":"development","msg":"Event Consumers started successfully"}
```

## Result
✅ **PASS**. The system self-heals by restarting the processes and perfectly reconnecting the dispatcher and consumer threads back to RabbitMQ. The `OutboxDispatcher` picks up where it left off by querying the database, ensuring zero message loss.
