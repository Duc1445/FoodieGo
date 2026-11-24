# Architecture

## 1. System Context
```mermaid
flowchart LR
  Customer[Customer] --> Web[FoodieGo Web App]
  Merchant[Merchant] --> Web
  Driver[Driver] --> Web
  Admin[Admin] --> Web
  Web --> Gateway[API Gateway]
  Gateway --> Identity[Identity Service]
  Gateway --> Restaurant[Restaurant Service]
  Gateway --> Order[Order Service]
  Gateway --> Payment[Payment Service]
  Order --> Inventory[Inventory Service]
  Inventory --> Rabbit[(RabbitMQ)]
  Payment --> Rabbit
  All[(Shared PostgreSQL / Redis / Observability)] --- Gateway
```

## 2. Container Diagram
```mermaid
flowchart TB
  subgraph Frontend
    Web[React + Vite Web App]
  end

  subgraph Edge
    Gateway[Node.js API Gateway]
  end

  subgraph Services
    Identity[Identity Service]
    Restaurant[Restaurant Service]
    Order[Order Service]
    Inventory[Inventory Service]
    Payment[Payment Service]
    Food[Food Projection Service]
  end

  subgraph Data
    Postgres[(PostgreSQL)]
    Redis[(Redis)]
    Rabbit[(RabbitMQ)]
  end

  subgraph Observability
    Prom[(Prometheus)]
    Grafana[(Grafana)]
    Loki[(Loki)]
    Tempo[(Tempo)]
  end

  Web --> Gateway
  Gateway --> Identity
  Gateway --> Restaurant
  Gateway --> Order
  Gateway --> Payment
  Order --> Inventory
  Inventory --> Rabbit
  Payment --> Rabbit
  Identity --> Postgres
  Restaurant --> Postgres
  Order --> Postgres
  Inventory --> Postgres
  Payment --> Postgres
  Identity --> Redis
  Restaurant --> Redis
  Order --> Redis
  Gateway --> Prom
  Identity --> Prom
  Restaurant --> Prom
  Order --> Prom
  Inventory --> Prom
  Payment --> Prom
  Gateway --> Loki
  Gateway --> Tempo
```

## 3. Component Diagram
```mermaid
flowchart LR
  subgraph Gateway
    GW1[Route proxy]
    GW2[Admin dashboard aggregation]
    GW3[Rate limiting / metrics]
  end

  subgraph OrderService
    O1[Cart API]
    O2[Checkout service]
    O3[Order service]
    O4[Delivery service]
    O5[Support service]
    O6[Promotion service]
    O7[Outbox / saga workers]
  end

  subgraph PaymentService
    P1[Webhook controller]
    P2[Payment domain service]
    P3[Gateway adapters]
    P4[Webhook inbox / reconciliation workers]
  end

  subgraph InventoryService
    I1[Reservation consumer]
    I2[Expiration worker]
    I3[Dispatcher]
  end

  GW1 --> O1
  GW1 --> O2
  GW1 --> O3
  GW1 --> O4
  GW1 --> O5
  GW1 --> O6
  GW2 --> Identity
  GW2 --> Restaurant
  GW2 --> OrderService
  P1 --> P2
  P2 --> P3
  P4 --> P1
  O7 --> Rabbit[(RabbitMQ)]
  I1 --> Rabbit
```

## 4. Checkout Saga Sequence
```mermaid
sequenceDiagram
  participant C as Customer
  participant W as Web App
  participant G as Gateway
  participant O as Order Service
  participant I as Inventory Service
  participant P as Payment Service
  participant R as RabbitMQ

  C->>W: Place order
  W->>G: POST /api/v1/orders/checkout
  G->>O: Forward request with JWT
  O->>O: Create order + outbox event
  O-->>W: 201 Created
  O->>R: Publish OrderPendingReservation
  R->>I: Consume reservation request
  I->>I: Reserve stock
  I->>R: Publish InventoryReserved or InventoryReservationFailed
  R->>O: Update order state
  O->>P: Payment requested / webhook flow
  P->>R: Publish PaymentCompleted or PaymentFailed
  R->>O: Confirm or compensate order
```

## 5. Deployment Diagram
```mermaid
flowchart TB
  subgraph Docker Compose Network
    Web[web:80]
    Gateway[gateway:3000]
    Identity[identity-service:3001]
    Restaurant[restaurant-service:3002]
    Order[order-service:3003]
    Inventory[inventory-service:3004]
    Payment[payment-service:3005]
    Postgres[(postgres:5432)]
    Redis[(redis:6379)]
    Rabbit[(rabbitmq:5672 / 15672)]
    Prom[(prometheus:9090)]
    Loki[(loki:3101)]
    Tempo[(tempo:3200 / 4317 / 4318)]
    Grafana[(grafana:3000 container / 3100 host)]
  end

  Web --> Gateway
  Gateway --> Identity
  Gateway --> Restaurant
  Gateway --> Order
  Gateway --> Payment
  Order --> Inventory
  Identity --> Postgres
  Restaurant --> Postgres
  Order --> Postgres
  Inventory --> Postgres
  Payment --> Postgres
  Identity --> Redis
  Restaurant --> Redis
  Order --> Redis
  Order --> Rabbit
  Inventory --> Rabbit
  Payment --> Rabbit
  Gateway --> Prom
  Gateway --> Loki
  Gateway --> Tempo
  Gateway --> Grafana
```

## 6. Key Architectural Notes
- The gateway is the public edge, but the backend services remain independently runnable for local development and testing.
- The database is shared in this repository for submission practicality, even though the architecture is modeled as microservices.
- Reliable message handling is implemented through outbox/inbox tables and RabbitMQ consumers.
- `food-service` is a projection/read-model service rather than a request/response API.
- Observability is wired through Prometheus metrics, structured logging, and OpenTelemetry traces.
