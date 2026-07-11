# Code vs Design Gap Analysis

## 1. Database Ownership
- **Docs State**: \`ADR-0004\` states "Each microservice owns its own database or schema."
- **Code State**: Currently adhered to. However, Food Service relies on eventual consistency to project data from Restaurant Service. Need to verify that the message broker (RabbitMQ) integration is fully fault-tolerant in code. No direct DB links found.

## 2. Authentication Strategy
- **Docs State**: \`ADR-0006\` states "Frontend MUST NOT decode JWTs. Read X-User-Id from pre-populated auth state."
- **Code State**: As of Sprint 2B, this rule is strictly enforced. The frontend interceptor (\`api.ts\`) reads from \`useAuthStore\` instead of decoding the token locally. Gap is closed.

## 3. Impeccable Frontend Quality
- **Docs State**: \`docs/frontend/frontend-quality-guidelines.md\` mandates Radix UI for all complex interactive components.
- **Code State**: Some legacy components in \`apps/web/src/shared/components/\` might still be using raw HTML/CSS for accessibility patterns instead of Radix primitives. 
- **Action**: Mark as technical debt. Migrate remaining legacy components to \`packages/ui\` Radix implementations in future sprints.

## 4. Pending Item IDs vs Global Loading
- **Docs State**: `DEVELOPMENT_RULES.md` mandates granular loading states.
- **Code State**: `useCartStore` currently uses an array for `pendingItemIds`.
- **Action**: Refactor to `Set<string>` for performance as discussed in Sprint 2B reviews.

## 5. Sprint Zero Runtime Validation
- **Docs State**: CI pipelines and architectural dependencies assume the code can build cleanly across all boundaries.
- **Code State**: Validated on Sprint Zero. The monorepo builds perfectly. No code-design gaps found in the build tooling or dependency chain. The `docker-compose.yml` matches the architecture accurately.

## 6. CI Pipeline Stability Fix
- **Identity route prefix mismatch resolved**: `identity-service` routes were updated from `/api/v1/auth` to `/api/auth` to match API Gateway expectations and automated tests.
- **oxlint replaced**: `oxlint` was replaced with standard `eslint` across `apps/web` due to native binary CI incompatibility on Linux runners.
- **Git submodule corruption fixed**: The `.agents` directory was mistakenly tracked as an embedded repository and has been converted into standard tracked files.
- **GitHub Actions upgraded**: Action runners updated from `v3` to `v4` and Node.js version standardized to `22` to prevent deprecation warnings.

## 7. pnpm v10 build script approval
- **Docs State**: CI pipelines implicitly assume dependencies install smoothly.
- **Code State**: pnpm v10 explicitly blocks execution of lifecycle scripts for dependencies by default to prevent supply-chain attacks. In the CI pipeline, this blocked installation.
- **Root Cause & Previous Failure**: The GitHub Actions runner was using `npm install -g pnpm`, which globally installed pnpm `v11`. Because `v11` completely drops support for the `"pnpm"` field in `package.json` and changes the syntax for whitelisting build scripts to `allowBuilds`, our previous attempt to whitelist packages using `"pnpm": {"onlyBuiltDependencies": [...]}` in `package.json` was ignored by `v11`, causing pipeline failures.
- **Action**: We enforced deterministic pnpm versioning across all GitHub Actions workflows by adding `"packageManager": "pnpm@10.34.5"` to `package.json` and enabling it via `corepack enable && corepack prepare pnpm@10.34.5 --activate`. We then moved the `onlyBuiltDependencies` array into the official v10 root configuration location: `pnpm-workspace.yaml`. The CI pipeline successfully passes verification without disabling security globally.
