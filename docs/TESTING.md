# Testing Documentation

## 1. Unit Test Strategy
- **Framework:** Jest
- **Scope:** Business logic, controllers, and utility functions within each microservice.
- **Mocking:** External dependencies like DB queries and RabbitMQ publishers are mocked.
- **Execution:** Run locally or on CI via `npm run test`.

## 2. Integration Test Strategy
- **Framework:** Jest + Supertest
- **Scope:** API endpoint verification, DB interactions.
- **Execution:** Uses a separate test database or in-memory DB.
- **K6 Load Testing:** We use K6 to perform load and stress testing on the API Gateway.

## 3. Manual Testing
- End-to-end flows are tested via the React Frontend or Postman.
- **Flow:** Register -> Create Restaurant -> Add Menu -> Order -> Pay.

## 4. Coverage
- Target: `>80%` for business critical services.
- Generated via Jest `--coverage` flag.
- Reported to SonarQube.

## 5. Test Commands
- **Run all unit tests:**
  ```bash
  pnpm test
  ```
- **Run load tests (K6):**
  ```bash
  pnpm test:load
  ```
- **Generate coverage report:**
  ```bash
  pnpm test --coverage
  ```
