# CI/CD Guidelines

## 1. Continuous Integration
Every PR must pass:
- `pnpm typecheck`
- `pnpm lint`
- Automated tests

## 2. Continuous Deployment
- Merges to `develop` automatically deploy to Staging.
- Merges to `main` automatically deploy to Production.
