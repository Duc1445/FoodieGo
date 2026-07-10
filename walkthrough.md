# Sprint 1 Walkthrough

## What changed
1. Added `apps/web/src/shared/auth/session.ts` to centralize JWT/session helpers.
2. Refactored `ProtectedRoute` and `RoleGuard` to share the same auth validation path.
3. Moved auth pages to explicit routes:
   - `/login`
   - `/register`
   - `/merchant/login`
   - `/merchant/register`
   - `/admin/login`
4. Kept `/` reserved for the customer portal so customer login now returns to the user web.
5. Replaced the merchant dashboard analytics screen with a skeleton-only Sprint 1 layout.
6. Updated auth response/store types to match the backend payload more closely.

## Why
- The blank screen after customer login came from route ambiguity around `/`.
- Sprint 1 only allows layouts and dashboard shells, not analytics or business logic in the portal dashboards.
- Central auth helpers remove duplicate token-handling logic and keep role redirects consistent.

---

## TypeScript Configuration Fix (Sprint 1 Completion)

### Root Cause
The monorepo `typecheck` script runs `pnpm -r exec tsc -b` across every workspace package.
`tsc -b` (build mode) requires a `tsconfig.json` to exist in the working directory it is invoked from.
Only two packages had one — `packages/ui` and `apps/web`. Every other package was a pure-JavaScript
package with no `tsconfig.json`, causing TypeScript to emit:

```
error TS5083: Cannot read file '<package>/tsconfig.json'.
```

for every JS-only package in `packages/` and `apps/`.

### Fix Applied
A minimal `tsconfig.json` was added to each JS-only workspace package.
The config does NOT change any source files or enable strict checking of legacy JS code:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "allowJs": true,
    "checkJs": false,
    "noEmit": true,
    "strict": false,
    "skipLibCheck": true
  },
  "include": ["**/*.js"],
  "exclude": ["node_modules"]
}
```

Key decisions:
- `checkJs: false` — JS files are parsed by TypeScript (for module graph) but not type-checked. This preserves the existing behaviour of those packages while satisfying `tsc -b`.
- `skipLibCheck: true` — Required to suppress duplicate-identifier conflicts in `@types/node@26.x` declaration files that are hoisted by pnpm into multiple packages. This only skips checking `.d.ts` files from node_modules, not source code.
- `module: "nodenext"` / `moduleResolution: "nodenext"` — Required pairing in TypeScript 6; `"node"` (node10) is deprecated and rejected at the TS6 error level.
- `noEmit: true` — JS-only packages have no build step; typecheck is a lint-only gate.

Packages that were completely empty (no source files yet: `api-sdk`, `ai`, `persistence`, `shared-types`, `shared-utils`):
- `api-sdk` received a placeholder `src/index.ts` (`export {};`) because the package already declared `"main": "src/index.ts"` and had TypeScript as a dev dependency.
- The other four empty packages (`ai`, `persistence`, `shared-types`, `shared-utils`) have no `package.json` and are therefore not visited by `pnpm -r exec`, so their tsconfigs are present for correctness but not exercised.

### Files Added
| File | Purpose |
|------|---------|
| `packages/config/tsconfig.json` | JS-only minimal config |
| `packages/contracts/tsconfig.json` | JS-only minimal config |
| `packages/core/tsconfig.json` | JS-only minimal config |
| `packages/database/tsconfig.json` | JS-only minimal config |
| `packages/logger/tsconfig.json` | JS-only minimal config |
| `packages/logging/tsconfig.json` | JS-only minimal config |
| `packages/metrics/tsconfig.json` | JS-only minimal config |
| `packages/otel/tsconfig.json` | JS-only minimal config |
| `packages/problem/tsconfig.json` | JS-only minimal config |
| `packages/rabbit/tsconfig.json` | JS-only minimal config |
| `packages/retry/tsconfig.json` | JS-only minimal config |
| `packages/testing/tsconfig.json` | JS-only minimal config |
| `packages/types/tsconfig.json` | JS-only minimal config |
| `packages/utils/tsconfig.json` | JS-only minimal config |
| `packages/platform-sdk/tsconfig.json` | JS-only minimal config |
| `packages/api-sdk/tsconfig.json` | TypeScript config (proper) |
| `packages/api-sdk/src/index.ts` | Placeholder — satisfies `include` pattern |
| `packages/ai/tsconfig.json` | Empty-package stub |
| `packages/persistence/tsconfig.json` | Empty-package stub |
| `packages/shared-types/tsconfig.json` | Empty-package stub |
| `packages/shared-utils/tsconfig.json` | Empty-package stub |
| `apps/gateway/tsconfig.json` | JS-only minimal config |
| `apps/identity-service/tsconfig.json` | JS-only minimal config |
| `apps/food-service/tsconfig.json` | JS-only minimal config |
| `apps/inventory-service/tsconfig.json` | JS-only minimal config |
| `apps/order-service/tsconfig.json` | JS-only minimal config |
| `apps/payment-service/tsconfig.json` | JS-only minimal config |
| `apps/restaurant-service/tsconfig.json` | JS-only minimal config |

### Verification Results
- `pnpm typecheck` — ✅ passes (exit 0, no errors)
- `pnpm lint` — ✅ passes (warnings only, 0 errors)
- `pnpm build` — ✅ passes (web app compiled + bundled successfully)
- `docker compose up --build` — ✅ all containers start successfully

## Known limitations
- Existing repo-wide lint warnings remain in files outside Sprint 1 scope.
- JS-only service packages are not type-checked (by design; they would need migration to TypeScript first).
