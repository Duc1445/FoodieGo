# 5. Building Block View

## 5.1 Level 1: System Context
- **Frontend App**: The React application.
- **Backend Services**: The collection of Node.js services.

## 5.2 Level 2: Microservices
- `gateway`: Reverse proxy.
- `identity-service`: Authentication and User management.
- `restaurant-service`: Catalog data for restaurants.
- `food-service`: CQRS based food search and details.
- `order-service`: Cart state (Redis) and Order lifecycle (PostgreSQL).
- `inventory-service`: Stock tracking.
- `payment-service`: Payment processing.
