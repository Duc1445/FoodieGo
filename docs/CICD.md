# CI/CD Documentation

## 1. Workflow Overview
FoodieGo uses GitHub Actions for validation, security scanning, and release automation.

## 2. Workflows
| File | Trigger | Purpose |
| --- | --- | --- |
| `.github/workflows/build.yml` | Push/PR to `main` and `develop` | Lint and build the workspace. |
| `.github/workflows/ci.yml` | Push/PR to `main`, `develop`, and `fix/**` | Install, lint, typecheck, migrate the database, run tests, and build. |
| `.github/workflows/unit-test.yml` | Push/PR to `main` and `develop` | Run the unit-test matrix against the backend services. |
| `.github/workflows/contracts.yml` | Push/PR to `main` and `develop` | Validate event contracts. |
| `.github/workflows/security.yml` | Push/PR to `main` and `develop` | Gitleaks, CodeQL, Semgrep, dependency audit, license scan, SBOM generation, and Trivy scanning. |
| `.github/workflows/release.yml` | Tag push `v*.*.*` | Generate SBOM and publish a GitHub release. |

## 3. Main CI Flow
The primary CI workflow does the following:
1. Checks out the repository.
2. Sets up Node.js 22 and pnpm.
3. Installs dependencies with `pnpm install --frozen-lockfile`.
4. Runs `pnpm lint`.
5. Runs `pnpm typecheck`.
6. Executes PostgreSQL migrations with `node infrastructure/postgres/migrations/migrate.js`.
7. Runs the workspace tests.
8. Builds the workspace with `pnpm build`.

## 4. Build and Release Behavior
- Build validation is intentionally separate from release publishing.
- The release workflow only runs on version tags.
- Release artifacts include an SBOM file.

## 5. Security Controls
The security workflow currently includes:
- Gitleaks for secrets scanning
- CodeQL for JavaScript static analysis
- Semgrep default rules
- `pnpm audit` for dependency issues
- license scanning to block GPL/AGPL families
- CycloneDX SBOM generation
- Trivy filesystem scanning for high and critical issues

## 6. Deployment Model
Current deployment is Docker Compose based.

Deployment topology:
- `web` serves the frontend on `80`
- `gateway` fronts the API on `3000`
- backend services expose their own ports for local development and health checks
- PostgreSQL, Redis, RabbitMQ, Prometheus, Loki, Tempo, and Grafana are provided as supporting services

## 7. Current Readiness Note
The workflow definitions exist, but the latest stored test evidence in the repository shows the web suite still needs attention before the project can be described as fully green at submission time.
