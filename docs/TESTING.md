# Testing Documentation

## 1. Test Strategy
The repository uses a layered testing approach:

- Unit tests for domain logic, services, utilities, and middleware
- Integration tests for route and repository behavior
- Contract tests for event schemas in `packages/contracts`
- Frontend component and page tests with Vitest and Testing Library
- Playwright-based end-to-end flow coverage for the web app

## 2. Backend Testing
### Identity service
- Jest with coverage enabled in `apps/identity-service`
- Focuses on auth, middleware, validation, and route behavior

### Restaurant service
- Jest with route and middleware tests
- Focuses on categories, menu items, reviews, and authorization checks

### Order service
- Jest tests for auth middleware, delivery model, order routes, and saga logic
- Includes tests for compensation and outbox behavior

### Inventory service
- Jest tests for reservation logic and compensation behavior
- The latest stored artifact shows this service meeting the 80% statement threshold

### Payment service
- Jest tests for payment workflows, webhook handling, race conditions, and chaos cases
- The service is the most complex runtime component because it combines webhooks, outbox writes, and gateway adapters

## 3. Frontend Testing
- Vitest is used for React component and page tests in `apps/web`
- Testing Library covers customer, merchant, and checkout flows
- The current captured run shows 15 passing tests and 5 failing tests in the web suite
- The failing tests are concentrated in `MerchantMenuPage.test.tsx` and the Playwright-style `e2e.test.ts`

## 4. Contract Tests
The repository contains JSON Schema contract tests under `packages/contracts/tests`.

Current contract coverage includes:
- `OrderPendingReservation`
- compatibility checks for V1 snapshots
- required-field validation
- type validation

Run with:
```bash
pnpm run test:contracts
```

## 5. Manual Testing
Recommended manual checks before submission:
1. Log in as customer, merchant, driver, and admin.
2. Browse restaurants and menus.
3. Add items to cart and complete checkout with an idempotency key.
4. Open the order, delivery, and support workflows.
5. Verify merchant voucher approval and admin dashboards.
6. Confirm that payment webhook handling updates the payment state as expected.

## 6. Coverage
Latest stored coverage artifacts in the repository show:

| Service | Statements |
| --- | --- |
| `inventory-service` | 83.72% |
| `food-service` | 77.78% |
| `identity-service` | 37.80% |
| `restaurant-service` | 5.04% |
| `order-service` | 4.26% |
| `payment-service` | 0.00% / no statement summary captured |

Interpretation:
- `inventory-service` and `food-service` are currently above the Level 2 threshold.
- The other backend services still need more tests or more complete coverage capture before the whole repository can be considered safe for a high-confidence submission.

## 7. Test Commands
```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm run test:contracts
pnpm --filter web test
pnpm --filter web exec playwright test
```

Service-specific examples:
```bash
pnpm --filter user-service test
pnpm --filter restaurant-service test
pnpm --filter order-service test
pnpm --filter @foodiego/inventory-service test
pnpm --filter payment-service test
```

## 8. CI Test Flow
The CI pipeline runs:
- lint
- typecheck
- database migrations
- backend tests
- build

The last captured local test summary in the repository shows the backend suites mostly passing, but the web suite is not fully green yet.
