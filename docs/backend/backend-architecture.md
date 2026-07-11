# Backend Architecture

Inspired by ASP.NET Core principles, FoodieGo enforces the following:

## 1. Separation of Concerns
Each microservice is divided into logical layers: Controllers/Routers, Services (Business Logic), and Repositories (Data Access).

## 2. Middleware Pipeline
Requests flow through a predictable pipeline: Logging -> Authentication -> Validation -> Controller.

## 3. Dependency Injection
Use DI patterns to decouple service logic from external dependencies (e.g., passing DB instances or loggers rather than importing globally).

## 4. Service Boundaries
Microservices communicate strictly via defined APIs (REST) or async events (RabbitMQ). Direct DB access is forbidden.

## 5. API Versioning
All APIs must be versioned (e.g., `/api/v1/...`) to support backward compatibility.
