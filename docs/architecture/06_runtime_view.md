# 6. Runtime View

## 6.1 Order Flow
1. User adds item to cart via API Gateway -> Order Service.
2. User proceeds to checkout, creating a session.
3. User confirms order. Order Service creates an order (Pending).
4. Order Service publishes `OrderCreated` event to RabbitMQ.
5. Inventory Service reserves stock; Payment Service processes payment.
