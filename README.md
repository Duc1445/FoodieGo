# FoodieGo 🍕

<div align="center">
  <p>
    <strong>A modern, microservices-based online food delivery platform</strong>
  </p>
  
  ![JavaScript](https://img.shields.io/badge/JavaScript-86%25-yellow)
  ![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
  ![License](https://img.shields.io/badge/license-MIT-green)
  ![Node.js](https://img.shields.io/badge/Node.js-22-green)
  ![React](https://img.shields.io/badge/React-19--RC-blue)
  ![Docker](https://img.shields.io/badge/Docker-Compose-blue)
</div>

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Database](#database)
- [Docker & Services](#docker--services)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring](#monitoring)
- [Roadmap](#roadmap)
- [License](#license)

---

## 📱 Project Overview

**FoodieGo** is a scalable, highly available food delivery platform designed to connect hungry customers with their favorite local restaurants. Built on a robust **microservices architecture** using Node.js, Express, PostgreSQL, Redis, and RabbitMQ, FoodieGo follows **Layered Domain-Driven Design (DDD)** principles for clean, maintainable code.

### Main Goals
- ✅ Provide a seamless customer experience for browsing and ordering food
- ✅ Ensure secure, reliable payment processing
- ✅ Enable restaurant management and order fulfillment
- ✅ Support admin operations and analytics
- ✅ Maintain high availability and scalability

### Current Status
- **Sprint 2A-2B**: ✅ Core browsing, cart, and checkout APIs completed
- **Sprint 2C**: 🚧 Order tracking (in progress)
- **Sprint 3**: 📋 Merchant portal (planned)
- **Sprint 4**: 📋 Admin portal (planned)

---

## ✨ Features

### Customer Web Application (`apps/web`)
- 🔍 Browse restaurants and search for food items
- 🛒 Real-time shopping cart with Redis caching
- 💳 Secure checkout with optimistic locking
- 📋 Order history and tracking (coming soon)
- 🗺️ Map integration for restaurant location discovery
- 🔐 User authentication and profile management

### API Gateway (`apps/gateway`)
- 🛣️ Request routing to microservices
- 🔐 JWT token validation
- ⚡ Rate limiting for API protection
- 📊 Prometheus metrics exposure
- 📖 Swagger/OpenAPI documentation
- 🛡️ Helmet security headers

### Identity Service (`apps/identity-service`)
- 👤 User registration and login
- 🔐 JWT token generation and validation
- 📝 User address management
- 🔄 Role-based access control (RBAC)
- 🔒 Password hashing with bcryptjs

### Restaurant Service (`apps/restaurant-service`)
- 🍽️ Restaurant catalog management
- 📍 Restaurant details and cuisine filtering
- ⭐ Restaurant ratings and reviews (schema ready)
- 🏪 Restaurant operational status

### Order Service (`apps/order-service`)
- 🛒 Shopping cart management
- 📦 Order creation and processing
- 📊 Order status tracking (PENDING → MERCHANT_ACCEPTED → PREPARING → READY → DELIVERING → COMPLETED)
- 💰 Order total calculation with tax and delivery fees
- 🔒 Optimistic locking for concurrent order updates

### Payment Service (`apps/payment-service`)
- 💳 Payment processing integration
- 🔄 Webhook handling for payment gateways
- 📝 Payment status reconciliation
- 🔁 Idempotency guarantees with webhook inbox
- 📤 Event publishing to order service via RabbitMQ
- 🛡️ Exactly-once delivery semantics using outbox pattern

### Food/Inventory Service (`apps/inventory-service`)
- 📦 Menu item catalog
- 🏪 Stock/inventory tracking
- 🔄 CQRS pattern for fast reads (planned)

### Shared Packages
- **@foodiego/platform-sdk** - Core types and constants
- **@foodiego/api-sdk** - HTTP client for APIs
- **@foodiego/ui** - Shared React components
- **@foodiego/core** - Common utilities
- **@foodiego/database** - Database connection & queries
- **@foodiego/rabbit** - RabbitMQ adapter & outbox dispatcher
- **@foodiego/shared-auth** - JWT & auth utilities
- **@foodiego/logging** - Structured JSON logging
- **@foodiego/metrics** - Prometheus metrics
- **@foodiego/otel** - OpenTelemetry tracing
- **@foodiego/config** - Environment configuration
- **@foodiego/testing** - Test utilities and mocks

---

## 🏗️ Architecture

### Monorepo Structure
```
FoodieGo/
├── apps/                        # Backend microservices + frontend
│   ├── web/                     # React customer portal (Vite)
│   ├── gateway/                 # API Gateway (Express)
│   ├── identity-service/        # Auth service
│   ├── restaurant-service/      # Restaurant catalog
│   ├── food-service/            # Food items (future)
│   ├── order-service/           # Carts & orders
│   ├── inventory-service/       # Stock management
│   └── payment-service/         # Payment processing
├── packages/                    # Shared libraries
│   ├── platform-sdk/            # Types & constants
│   ├── api-sdk/                 # HTTP client
│   ├── ui/                      # Shared components
│   ├── core/                    # Core utilities
│   ├── database/                # Database layer
│   ├── rabbit/                  # Message queue
│   ├── shared-auth/             # Auth utilities
│   ├── logging/                 # Logging
│   ├── metrics/                 # Prometheus
│   ├── otel/                    # OpenTelemetry
│   └── ...
├── infrastructure/              # Database & setup scripts
│   └── postgres/                # Migrations & init scripts
├── docs/                        # Architecture & ADRs
├── .github/
│   └── workflows/               # CI/CD pipelines
└── docker-compose.yml           # Local development stack
```

### Microservice Architecture Diagram

```mermaid
graph TB
    Client["🌐 Customer Web App<br/>(React)"]
    Gateway["🛣️ API Gateway<br/>(Express)"]
    
    Identity["👤 Identity Service<br/>(Auth & Users)"]
    Restaurant["🍽️ Restaurant Service<br/>(Catalog)"]
    Order["📦 Order Service<br/>(Cart & Orders)"]
    Payment["💳 Payment Service<br/>(Payments)"]
    
    RabbitMQ["📤 RabbitMQ<br/>(Event Bus)"]
    PostgreSQL["🗄️ PostgreSQL<br/>(Main DB)"]
    Redis["⚡ Redis<br/>(Cache & Cart)"]
    
    Client -->|HTTP/REST| Gateway
    
    Gateway -->|/api/v1/auth/*| Identity
    Gateway -->|/api/v1/restaurants/*| Restaurant
    Gateway -->|/api/v1/orders/*| Order
    
    Order -->|Process Payment| Payment
    Payment -->|Events| RabbitMQ
    RabbitMQ -->|Consume| Order
    
    Identity -->|Read/Write| PostgreSQL
    Restaurant -->|Read| PostgreSQL
    Order -->|Read/Write| PostgreSQL
    Payment -->|Read/Write| PostgreSQL
    
    Order -->|Cache| Redis
    Identity -->|Cache| Redis
```

### Request Flow (Example: Place Order)

```
1. Customer clicks "Place Order" → web/checkout
2. POST /api/v1/orders → API Gateway
3. Gateway validates JWT → Identity Service
4. Gateway routes to Order Service
5. Order Service:
   - Validates cart items
   - Calculates totals (with tax, delivery fee)
   - Creates order in PENDING status
   - Publishes OrderCreated event to RabbitMQ
6. Payment Service:
   - Consumes OrderCreated event
   - Initiates payment with gateway
   - Publishes PaymentAuthorized event
7. Order Service:
   - Consumes PaymentAuthorized
   - Transitions order to MERCHANT_ACCEPTED
8. Response → Customer sees confirmation
```

### Authentication Flow

```mermaid
sequenceDiagram
    Client->>Gateway: POST /api/v1/auth/login
    Gateway->>Identity: Login request
    Identity->>PostgreSQL: Query user
    Identity->>Identity: Verify password (bcrypt)
    Identity->>Identity: Generate JWT (HS256)
    Identity-->>Client: JWT token
    Client->>Client: Store token (localStorage)
    
    Client->>Gateway: GET /api/v1/orders (+ JWT)
    Gateway->>Gateway: Validate JWT signature
    Gateway->>Order: Request (with user context)
    Order-->>Gateway: Orders data
    Gateway-->>Client: Orders JSON
```

### Database Architecture

Each microservice owns its data:
- **Identity Service**: Users, addresses, roles
- **Restaurant Service**: Restaurants, menus, descriptions
- **Order Service**: Orders, order items, cart items
- **Payment Service**: Payments, payment methods, webhooks
- **Inventory Service**: Food items, stock levels

Event sourcing via **outbox pattern**:
```
Microservice → PostgreSQL (main transaction)
            ↓
         Outbox Table (reliably recorded)
            ↓
    Outbox Dispatcher (polls periodically)
            ↓
         RabbitMQ (published)
            ↓
    Other Services (consume)
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, Vite, TypeScript | SPA for customers |
| **Frontend State** | Zustand | State management |
| **Frontend UI** | Tailwind CSS, Radix UI, Lucide Icons | Styling & components |
| **Frontend Forms** | React Hook Form | Form handling |
| **Frontend Query** | TanStack React Query | Data fetching & caching |
| **Frontend Testing** | Vitest, Playwright, Testing Library | Unit & E2E tests |
| **Backend Runtime** | Node.js 22, ES Modules | JavaScript runtime |
| **Backend Framework** | Express 4 | REST API server |
| **Database** | PostgreSQL 15 | Relational data store |
| **Caching** | Redis 7 | Cache & sessions |
| **Message Queue** | RabbitMQ 3 | Event streaming |
| **API Gateway** | Express + http-proxy | Request routing |
| **Authentication** | JWT (HS256), bcryptjs | Auth & password |
| **Security** | Helmet, express-rate-limit | HTTP security |
| **Logging** | Winston, structured JSON | Application logs |
| **Metrics** | Prometheus (prom-client) | Performance monitoring |
| **Tracing** | OpenTelemetry | Distributed tracing |
| **Container** | Docker, Docker Compose | Local & deployment |
| **Package Manager** | pnpm 10.34.5 | Dependency management |
| **Linting** | ESLint | Code quality |
| **Formatting** | Prettier | Code formatting |
| **Testing** | Jest, Vitest | Unit & integration tests |
| **CI/CD** | GitHub Actions | Automation pipeline |

---

## 📁 Project Structure

### Root Level
```
FoodieGo/
├── apps/                     # Microservices and frontend
├── packages/                 # Shared libraries
├── infrastructure/           # Database migrations, init scripts
├── docs/                     # Architecture documentation (arc42)
├── .github/workflows/        # CI/CD pipelines (7 workflows)
├── package.json              # Root workspace config
├── pnpm-workspace.yaml       # Monorepo configuration
├── docker-compose.yml        # Local development stack
├── tsconfig.json             # TypeScript root config
├── eslint.config.js          # ESLint configuration
└── README.md                 # This file
```

### `apps/` Directory

| App | Type | Purpose | Stack |
|-----|------|---------|-------|
| `web` | Frontend SPA | Customer portal | React, Vite, TypeScript |
| `gateway` | Backend | API routing & auth | Express, Node.js |
| `identity-service` | Backend | User management | Express, PostgreSQL, JWT |
| `restaurant-service` | Backend | Restaurant catalog | Express, PostgreSQL |
| `food-service` | Backend | Menu items | Express, PostgreSQL |
| `order-service` | Backend | Orders & cart | Express, PostgreSQL, Redis |
| `inventory-service` | Backend | Stock tracking | Express, PostgreSQL |
| `payment-service` | Backend | Payment processing | Express, PostgreSQL, RabbitMQ |

### `packages/` Directory

| Package | Purpose |
|---------|---------|
| `platform-sdk` | Shared types, enums, constants |
| `api-sdk` | HTTP client with Axios |
| `ui` | React component library |
| `core` | Utilities & helpers |
| `database` | PostgreSQL connection & queries |
| `rabbit` | RabbitMQ adapter & outbox pattern |
| `shared-auth` | JWT & auth utilities |
| `logging` | JSON structured logging |
| `metrics` | Prometheus metrics |
| `otel` | OpenTelemetry tracing |
| `config` | Environment configuration |
| `testing` | Test mocks & utilities |
| `shared-types` | TypeScript types |
| `shared-utils` | Common utilities |
| `retry` | Retry logic |
| `problem` | Error handling |
| `contracts` | API contract tests |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 22+ ([Download](https://nodejs.org/))
- **pnpm** 10.34.5+ ([Install](https://pnpm.io/installation))
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** ([Download](https://git-scm.com/))

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/Duc1445/FoodieGo.git
cd FoodieGo
```

#### 2. Install Dependencies
```bash
pnpm install
```

#### 3. Environment Setup

Create a `.env` file in the root directory:
```env
# Database
POSTGRES_USER=foodiego
POSTGRES_PASSWORD=foodiego123
POSTGRES_DB=foodiego

# Redis
REDIS_PASSWORD=redis123
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Identity Service
IDENTITY_SERVICE_PORT=3001

# Order Service
ORDER_SERVICE_PORT=3002

# Payment Service
PAYMENT_SERVICE_PORT=3003

# Gateway
GATEWAY_PORT=3000

# Environment
NODE_ENV=development
```

### Docker Setup

#### Start All Services
```bash
# Build and start all containers
docker compose up --build -d

# View logs
docker compose logs -f

# Stop all containers
docker compose down

# Clean up volumes
docker compose down -v
```

#### Verify Services
```bash
# API Gateway
curl http://localhost:3000/health

# Identity Service
curl http://localhost:3001/health

# Order Service
curl http://localhost:3002/health

# PostgreSQL
docker compose exec postgres psql -U foodiego -d foodiego -c "SELECT version();"

# Redis
docker compose exec redis redis-cli ping
```

### Running Services Locally

#### Frontend (React)
```bash
# Development mode with hot reload
pnpm --filter web run dev

# Build for production
pnpm --filter web run build

# Preview production build
pnpm --filter web run preview
```

#### Backend Services
```bash
# Run all services in development
pnpm dev

# Run a specific service
pnpm --filter identity-service run dev

# Build all services
pnpm build

# Lint all code
pnpm lint

# Type check
pnpm typecheck
```

### Database & Migrations

```bash
# Migrations run automatically on docker compose up
# Or manually:
docker compose run --rm migration-runner node migrate.js

# Seed demo data
pnpm run seed:all

# Generate realistic data
pnpm run demo:seed

# Verify demo data
pnpm run demo:verify
```

### Redis Setup

Redis starts automatically in Docker Compose. To interact:
```bash
# Connect to Redis CLI
docker compose exec redis redis-cli -a redis123

# Check cache
127.0.0.1:6379> KEYS *
127.0.0.1:6379> GET cart:user-123
127.0.0.1:6379> DEL cart:user-123
```

### RabbitMQ Setup

RabbitMQ management console: `http://localhost:15672`
- Default credentials: `guest` / `guest`

Queues created:
- `order.events` - Order events
- `payment.events` - Payment events
- `reconciliation.queue` - Payment reconciliation

---

## 💻 Development

### Common Commands

```bash
# Install dependencies
pnpm install
pnpm add <package>

# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run integration tests
pnpm test:integration

# Run contract tests
pnpm test:contracts

# Watch tests
pnpm run test:watch

# Lint code
pnpm lint

# Fix linting issues
pnpm run lint:fix

# Type checking
pnpm typecheck

# Build all projects
pnpm build

# Build specific app
pnpm --filter <app-name> run build

# Development mode
pnpm dev

# Seed database
pnpm run seed:all

# Generate demo data
pnpm run demo:seed
pnpm run demo:verify

# Run migrations
node infrastructure/postgres/migrations/migrate.js

# Docker operations
docker compose up --build    # Start
docker compose down -v       # Clean up
docker compose logs -f       # View logs
```

### Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add order status tracking"
git commit -m "fix: resolve payment webhook timing issue"
git commit -m "refactor: improve error handling in order service"
git commit -m "docs: update API documentation"
git commit -m "test: add payment reconciliation tests"
git commit -m "chore: update dependencies"
```

---

## 📡 API Overview

### Base URL
```
http://localhost:3000/api/v1
```

### Identity APIs
```
POST   /auth/register          - User registration
POST   /auth/login             - User login
POST   /auth/logout            - User logout
GET    /auth/me                - Get current user
POST   /auth/refresh-token     - Refresh JWT
GET    /addresses              - Get user addresses
POST   /addresses              - Create address
PUT    /addresses/:id          - Update address
DELETE /addresses/:id          - Delete address
```

### Restaurant APIs
```
GET    /restaurants            - List restaurants
GET    /restaurants/:id        - Get restaurant details
GET    /restaurants/:id/menu   - Get restaurant menu
GET    /restaurants/search     - Search restaurants
GET    /restaurants/:id/status - Get operational status
```

### Order APIs
```
POST   /orders                 - Create order
GET    /orders                 - Get order history
GET    /orders/:id             - Get order details
PATCH  /orders/:id/status      - Update order status
DELETE /orders/:id             - Cancel order

# Cart endpoints
GET    /orders/cart            - Get shopping cart
POST   /orders/cart/items      - Add to cart
PUT    /orders/cart/items/:id  - Update cart item
DELETE /orders/cart/items/:id  - Remove from cart
POST   /orders/checkout        - Finalize checkout
```

### Payment APIs (Internal)
```
POST   /payments               - Create payment
GET    /payments/:id           - Get payment details
POST   /payments/:id/refund    - Request refund
POST   /webhooks/payment       - Handle gateway webhooks
```

### Gateway Endpoints
```
GET    /health                 - Gateway health check
GET    /metrics                - Prometheus metrics
GET    /api-docs               - Swagger UI
```

---

## 🔐 Authentication

### JWT Flow

1. **Registration/Login**
   ```
   POST /api/v1/auth/login
   { "email": "user@example.com", "password": "secret" }
   → Returns: { "token": "eyJhbGc...", "refreshToken": "..." }
   ```

2. **Store Token**
   ```javascript
   localStorage.setItem('authToken', response.token);
   ```

3. **API Requests**
   ```javascript
   fetch('/api/v1/orders', {
     headers: { 'Authorization': 'Bearer ' + token }
   })
   ```

4. **Validation**
   - Gateway validates JWT signature
   - Extracts user ID & role
   - Passes to downstream services

### User Roles (RBAC)

| Role | Permissions |
|------|------------|
| **customer** | Browse restaurants, create/view orders |
| **merchant** | Manage own restaurant, accept/track orders |
| **admin** | Full platform access |
| **driver** | View assigned orders, update delivery status |

### Password Security

- Hashed with bcryptjs (10 rounds)
- Never stored in plaintext
- JWT tokens expire after 7 days
- Refresh tokens for long-lived sessions

---

## 🗄️ Database

### Entity-Relationship Diagram

```
Users (Identity Service)
├── id (PK)
├── email (UNIQUE)
├── password_hash
├── role
├── created_at
└── Addresses (1-to-many)
    ├── id (PK)
    ├── user_id (FK)
    ├── address
    └── is_default

Restaurants
├── id (PK)
├── name
├── description
├── cuisine
├── rating
├── is_open
└── MenuItems (1-to-many)
    ├── id (PK)
    ├── restaurant_id (FK)
    ├── name
    └── price

Orders
├── id (PK)
├── user_id (FK)
├── restaurant_id (FK)
├── status (ENUM)
├── total_amount
├── created_at
└── OrderItems (1-to-many)
    ├── id (PK)
    ├── order_id (FK)
    ├── menu_item_id (FK)
    └── quantity

Payments
├── id (PK)
├── order_id (FK)
├── amount
├── status (ENUM)
├── gateway_provider
├── gateway_tx_id
└── PaymentRetries (1-to-many)
    ├── id (PK)
    ├── payment_id (FK)
    └── attempted_at

Outbox (Event Sourcing)
├── id (PK)
├── event_id (UNIQUE)
├── aggregate_type
├── aggregate_id
├── event_type
├── payload (JSONB)
└── status (PENDING|PUBLISHED)

WebhookInbox (Deduplication)
├── id (PK)
├── event_id (UNIQUE)
├── source (gateway_provider)
├── payload (JSONB)
└── processed_at
```

### Major Tables

- `users` - User accounts
- `addresses` - Delivery addresses
- `restaurants` - Restaurant information
- `menu_items` - Food items
- `carts` - Redis-backed (ephemeral)
- `orders` - Order records
- `order_items` - Line items
- `payments` - Payment records
- `outbox_events` - Event log
- `webhook_inbox` - Webhook deduplication

### Key Constraints

- Foreign key relationships
- Unique constraints on email, restaurant names
- Check constraints on order status, payment status
- Indexes on frequently queried columns

---

## 🐳 Docker & Services

### Docker Compose Services

| Service | Image | Port | Health Check | Purpose |
|---------|-------|------|--------------|---------|
| **postgres** | postgres:15-alpine | 5432 | pg_isready | Main database |
| **redis** | redis:7-alpine | 6379 | redis-cli ping | Cache & sessions |
| **rabbitmq** | rabbitmq:3-mgmt-alpine | 5672/15672 | rabbitmq-diagnostics | Message broker |
| **migration-runner** | node:20-alpine | - | - | DB migrations |
| **identity-service** | Built from Dockerfile | 3001 | GET /health | Auth service |
| **restaurant-service** | Built from Dockerfile | 3002 | GET /health | Restaurant service |
| **order-service** | Built from Dockerfile | 3003 | GET /health | Order service |
| **payment-service** | Built from Dockerfile | 3004 | GET /health | Payment service |
| **gateway** | Built from Dockerfile | 3000 | GET /health | API Gateway |

### Exposed Ports

```
3000  - API Gateway
3001  - Identity Service
3002  - Restaurant Service
3003  - Order Service
3004  - Inventory Service
3005  - Payment Service
5432  - PostgreSQL
6379  - Redis
5672  - RabbitMQ (AMQP)
15672 - RabbitMQ Management Console
```

### Container Networking

All containers run on `foodiego-net` bridge network for inter-container communication:

```
web → gateway:3000 → [identity-service, restaurant-service, order-service]
↓                      ↓
localhost:3000         PostgreSQL, Redis, RabbitMQ
```

---

## 🔧 Environment Variables

### Database
```env
POSTGRES_USER=foodiego
POSTGRES_PASSWORD=foodiego123
POSTGRES_DB=foodiego
DATABASE_URL=postgresql://foodiego:foodiego123@localhost:5432/foodiego
```

### Redis
```env
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=redis123
```

### RabbitMQ
```env
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_DEFAULT_USER=guest
RABBITMQ_DEFAULT_PASS=guest
```

### JWT & Security
```env
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Services
```env
GATEWAY_PORT=3000
IDENTITY_SERVICE_PORT=3001
RESTAURANT_SERVICE_PORT=3002
ORDER_SERVICE_PORT=3003
INVENTORY_SERVICE_PORT=3004
PAYMENT_SERVICE_PORT=3005
```

### Monitoring (Optional)
```env
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
PROMETHEUS_PORT=9090
GRAFANA_PORT=3010
```

### Payment Gateway (Mock/Real)
```env
PAYMENT_GATEWAY=mock
# PAYMENT_GATEWAY=vnpay
# VNPAY_API_URL=...
# VNPAY_ACCESS_CODE=...
```

---

## ✅ Testing

### Unit Tests

Run all unit tests:
```bash
pnpm test:unit
```

Test a specific service:
```bash
pnpm --filter payment-service run test
```

Watch mode:
```bash
pnpm run test:watch
```

Coverage:
```bash
pnpm test -- --coverage
```

### Integration Tests

```bash
pnpm test:integration
```

Tests database connections, external service calls, transaction handling.

### Contract Tests

```bash
pnpm test:contracts
```

Tests API contracts between services.

### E2E Tests (Frontend)

```bash
# Playwright E2E tests
pnpm --filter web run test:e2e

# Run in headed mode
pnpm --filter web run test:e2e -- --headed

# Debug
pnpm --filter web run test:e2e -- --debug
```

### Test Strategy

- **Unit Tests**: Service logic, utilities
- **Integration Tests**: Database, RabbitMQ, external APIs
- **Contract Tests**: API contract validation
- **E2E Tests**: Full user workflows (Playwright)
- **Chaos Tests**: Resilience & failure scenarios (payment-service)

---

## 📊 Monitoring

### Prometheus Metrics

Exposed at: `http://localhost:3000/metrics`

Metrics tracked:
- HTTP request duration & count (by endpoint, method, status)
- Payment processing time
- Database query duration
- RabbitMQ message processing
- Cache hit/miss rates

### Health Checks

All services expose:
```
GET /health → { status: "healthy" }
```

Checked every 10 seconds with 5-second timeout.

### Logging

Structured JSON logging to stdout:
```json
{
  "severity": "INFO",
  "timestamp": "2026-07-15T17:39:51Z",
  "service": "order-service",
  "requestId": "abc-123",
  "method": "POST",
  "url": "/api/v1/orders",
  "statusCode": 201,
  "duration": 145,
  "userId": "user-456"
}
```

### Distributed Tracing

OpenTelemetry integration (optional):
```env
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

Traces include:
- Database queries
- RabbitMQ message handling
- HTTP requests
- Service-to-service calls

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows (7 Workflows)

#### 1. **MVP CI** (`ci.yml`)
- **Trigger**: Push/PR to main & develop
- **Runs on**: Ubuntu Latest
- **Services**: Redis, RabbitMQ, PostgreSQL
- **Steps**:
  - ✅ Install dependencies (pnpm)
  - ✅ Lint code
  - ✅ Type check
  - ✅ Run all tests
  - ✅ Build projects

**Status**: ✅ Passing

#### 2. **Unit Tests** (`unit-test.yml`)
- **Trigger**: Push/PR to develop & main
- **Runs on**: Ubuntu Latest
- **Services**: Redis, RabbitMQ, PostgreSQL
- **Steps**:
  - ✅ Install dependencies
  - ✅ Run unit tests (`pnpm test:unit`)

**Status**: ✅ Passing (after fixes)

#### 3. **Contract Tests** (`contracts.yml`)
- **Trigger**: Push/PR to develop & main
- **Steps**:
  - ✅ Run contract tests
  - ✅ Validate API contracts

**Status**: ✅ Passing

#### 4. **Build** (`build.yml`)
- **Trigger**: workflow_call, push/PR
- **Steps**:
  - ✅ Build all projects
  - ✅ Lint code

**Status**: ✅ Passing

#### 5. **Security Pipeline** (`security.yml`)
- **Trigger**: Push/PR to develop & main
- **Jobs**:
  - **SAST**: Gitleaks, CodeQL, Semgrep
  - **Dependencies**: Audit, License scan, SBOM
  - **Container**: Trivy filesystem scan
- **Status**: ✅ Passing

#### 6. **Release** (`release.yml`)
- **Trigger**: Git tags (v*.*.*)
- **Steps**:
  - Generate SBOM (Software Bill of Materials)
  - Create GitHub release
  - Attach SBOM

**Status**: ✅ Configured

#### 7. **Agents Release** (`.agents/.github/workflows/release.yml`)
- **Trigger**: Push to main
- **Steps**:
  - Version management with changesets
  - Create version PR

**Status**: ✅ Configured

### Workflow Features

- ✅ **Concurrency Control**: Cancel in-progress runs for same workflow/ref
- ✅ **Caching**: Node modules cached with pnpm
- ✅ **Security**: Code scanning, dependency audit, secrets detection
- ✅ **Service Dependencies**: Wait for PostgreSQL, Redis, RabbitMQ to be healthy
- ✅ **Environment Setup**: Database migrations, proper config
- ✅ **Error Handling**: Tests with fallback when services unavailable
- ✅ **Monitoring**: Health checks for all containers

### CI/CD Status Badge
```markdown
[![CI Status](https://github.com/Duc1445/FoodieGo/workflows/MVP%20CI/badge.svg)](https://github.com/Duc1445/FoodieGo/actions)
```

---

## 🗺️ Roadmap

### ✅ Completed (Sprint 2A-2B)
- [x] Core API infrastructure
- [x] User authentication & registration
- [x] Restaurant browsing
- [x] Shopping cart with Redis
- [x] Order creation & payment processing
- [x] Order status tracking
- [x] Database migrations
- [x] Docker Compose setup
- [x] CI/CD pipelines

### 🚧 In Progress (Sprint 2C)
- [ ] Real-time order tracking WebSocket
- [ ] Order history & statistics
- [ ] Payment reconciliation improvements
- [ ] Driver assignment logic
- [ ] Delivery tracking

### 📋 Planned (Sprint 3)
- [ ] Merchant portal
- [ ] Restaurant dashboard
- [ ] Order management interface
- [ ] Menu management
- [ ] Staff role management

### 📋 Future (Sprint 4+)
- [ ] Admin dashboard
- [ ] Analytics & reporting
- [ ] Promotions & discounts
- [ ] Advanced search & filters
- [ ] Reviews & ratings
- [ ] Push notifications

---

## 👥 Contributors

FoodieGo is maintained by:
- [@Duc1445](https://github.com/Duc1445) - Project lead

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 🤝 Support & Issues

Found a bug or have a suggestion?
- 🐛 [Create an Issue](https://github.com/Duc1445/FoodieGo/issues)
- 💬 [Start a Discussion](https://github.com/Duc1445/FoodieGo/discussions)

---

## 📖 Additional Resources

- [Architecture Documentation](./docs/architecture/)
- [Development Rules](./DEVELOPMENT_RULES.md)
- [API Documentation](./docs/api/)
- [Database Schema](./infrastructure/postgres/)
- [Docker Compose Reference](./docker-compose.yml)

---

<div align="center">
  <p>Made with ❤️ by the FoodieGo team</p>
  <p>
    <a href="https://github.com/Duc1445/FoodieGo">GitHub</a> •
    <a href="https://github.com/Duc1445/FoodieGo/issues">Issues</a> •
    <a href="https://github.com/Duc1445/FoodieGo/discussions">Discussions</a>
  </p>
</div>
