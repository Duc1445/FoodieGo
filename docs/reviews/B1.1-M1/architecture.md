# Milestone 1: API Foundation - Architecture Review

## 1. Overview
Milestone 1 introduces a centralized `packages/core` platform layer to enforce architectural rules across all FoodieGo microservices. This guarantees standardization in Error Handling, Logging, Validation, and Response formatting.

## 2. Request Flow (Sequence Diagram)

```mermaid
sequenceDiagram
    participant Client
    participant API Gateway
    participant RestaurantController
    participant ValidatorMiddleware
    participant RestaurantService
    participant RestaurantRepository
    participant Database

    Client->>API Gateway: GET /api/v1/restaurants
    Note over API Gateway: Generate X-Correlation-ID
    API Gateway->>RestaurantController: Proxy Request
    Note over RestaurantController: correlationIdMiddleware <br/> (inject to Pino & res.locals)
    RestaurantController->>ValidatorMiddleware: Validate Request
    ValidatorMiddleware-->>RestaurantController: Validated
    RestaurantController->>RestaurantService: getAllRestaurants(query)
    RestaurantService->>RestaurantRepository: findAll({ page, limit, search })
    RestaurantRepository->>Database: SQL Query
    Database-->>RestaurantRepository: Result Set
    RestaurantRepository-->>RestaurantService: Mapped Entities
    RestaurantService-->>RestaurantController: Return Data
    Note over RestaurantController: format with successResponse()
    RestaurantController-->>API Gateway: Standardized JSON Envelope
    API Gateway-->>Client: 200 OK
```

## 3. Key Components
- **`@foodiego/core`**: The shared NPM workspace package containing `logger`, `errors`, `response`, `config`, and `middleware`.
- **API Versioning**: Enforced `/api/v1` prefixing across all internal service routes and Gateway routing.
- **Health Probes**: Implemented Kubernetes-compliant `/live`, `/ready`, `/health`, and `/version` endpoints.
