# Decisions

1. **Monorepo Library Extraction:** We decided to extract common infrastructure (errors, logging, response, validation) into a shared workspace package (`@foodiego/core`). This avoids duplicating code and ensures consistency across microservices.
2. **Pino Logger:** Selected Pino over Winston for its minimal overhead and native JSON structure.
3. **API Response Envelope:** Defined a strict `{ success, data, pagination, request, error }` format. This shifts the burden of parsing API responses away from the frontend and creates a standard contract.
4. **AppError Hierarchy:** Adopted an OOP approach for errors (`AppError`, `NotFoundError`, `ConflictError`) so the Express Error Middleware can intelligently map errors to appropriate HTTP status codes, without cluttering the Service layer with HTTP logic.
5. **Validation Middleware:** Centralized request validation using Zod/express-validator inside the route definition, preventing invalid payloads from ever reaching the Controller.
