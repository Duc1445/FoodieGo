# Testing Strategy

## 1. Test Pyramid
- **Unit Tests**: Fast, isolated tests for utilities (e.g., `pricing.ts`), pure functions, and reducers.
- **Integration Tests**: Tests for API endpoints hitting a test database.
- **E2E Tests**: Critical user journeys (e.g., Checkout flow) running in a real browser against a staging environment.

## 2. Testing Philosophy
- Write tests to verify behavior, not implementation details.
- Avoid mocking unless necessary (e.g., external payment gateways). Prefer testing against real lightweight dependencies.
