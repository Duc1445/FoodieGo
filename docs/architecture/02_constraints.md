# 2. Architecture Constraints

## 2.1 Technical Constraints
- Must be a Monorepo using `pnpm` workspaces.
- React Frontend (Vite, TypeScript, Zustand).
- Node.js Microservices Backend.
- PostgreSQL for persistent data, Redis for caching/ephemeral data.
- RabbitMQ for async messaging.

## 2.2 Organizational Constraints
- MVP mindset: Avoid over-engineering. Build only what is needed for the current phase.
- Backend is the absolute source of truth.
