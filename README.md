# FoodieGo

<div align="center">
  <p>
    <strong>A modern, microservices-based online food delivery platform.</strong>
  </p>
</div>

## Overview
FoodieGo is a scalable, highly available food delivery platform designed to connect hungry customers with their favorite local restaurants. Built on a robust microservices architecture, FoodieGo ensures fast browsing, reliable ordering, and a seamless developer experience using a modern tech stack.

## Features
- **Customer Portal**: Browse restaurants, search for food items, and manage shopping carts.
- **Real-time Cart**: Ephemeral and highly available cart storage.
- **Secure Checkout**: Safe order processing with Optimistic Locking and Idempotency guarantees.
- **Order Tracking**: (Upcoming) Real-time tracking of order status.
- **Merchant & Admin Portals**: (Upcoming) Comprehensive management dashboards.

## System Architecture
FoodieGo follows a microservices architecture pattern orchestrated in a Monorepo. For deep architectural details, see our [arc42 Architecture Documentation](./docs/architecture/01_introduction_and_goals.md) and [Architecture Decision Records](./docs/adr/0001-record-architecture-decisions.md).

## Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Zustand, TailwindCSS, Radix UI.
- **Backend Services**: Node.js, Express.
- **Databases**: PostgreSQL (Relational), Redis (Caching & Cart).
- **Infrastructure**: Docker Compose, RabbitMQ (Event Bus), Nginx (API Gateway).

## Screenshots
> *(Placeholder for UI Screenshots)*

## Installation
### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (v8+)
- [Docker & Docker Compose](https://www.docker.com/)

### Environment Setup
1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/Duc1445/FoodieGo.git
   cd FoodieGo
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   pnpm install
   \`\`\`

## Development Workflow
To start the entire stack locally:
\`\`\`bash
docker compose up --build -d
\`\`\`
This will spin up all microservices, databases, and message brokers.
To run the frontend locally in dev mode:
\`\`\`bash
pnpm --filter web run dev
\`\`\`

## Project Structure
\`\`\`
├── apps/
│   ├── web/                 # Customer Frontend SPA
│   ├── gateway/             # API Gateway
│   ├── identity-service/    # Auth & Users
│   ├── restaurant-service/  # Restaurant Catalog
│   ├── food-service/        # Food Items (CQRS)
│   ├── order-service/       # Carts & Orders
│   ├── inventory-service/   # Stock Management
│   └── payment-service/     # Payment Processing
├── packages/
│   ├── ui/                  # Shared Component Library
│   ├── eslint-config/       # Linting rules
│   └── typescript-config/   # TS configs
├── docs/                    # arc42 and ADRs
└── docker-compose.yml
\`\`\`

## API Documentation
The API Gateway routes requests to individual services:
- `/api/v1/auth/*` -> Identity Service
- `/api/v1/restaurants/*` -> Restaurant Service
- `/api/v1/orders/*` -> Order Service

## Database
Each microservice maintains its own database schema.
- **Order Service**: PostgreSQL for orders, Redis for shopping carts.
- **Food Service**: PostgreSQL with materialized views for fast searching.

## Testing
To run the test suite across the monorepo:
\`\`\`bash
pnpm test
\`\`\`

## Deployment
All services are containerized. Use standard Docker deployment strategies or orchestrators like Kubernetes. (Deployment guides WIP).

## Contribution Guide
Please read our [Development Rules](./DEVELOPMENT_RULES.md) before contributing. We strictly follow the MVP mindset and treat the Backend as the Single Source of Truth.

## Roadmap
- [x] Sprint 2A & 2B: Core Browsing, Cart, and Checkout APIs.
- [ ] Sprint 2C: Order Tracking and History.
- [ ] Sprint 3: Merchant Portal.
- [ ] Sprint 4: Admin Portal.

## License
MIT License
