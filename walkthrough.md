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

## Verification results
- Web build passes.
- Full workspace lint passes with warnings only.
- Full workspace typecheck still fails because unrelated package `tsconfig.json` files are missing.
- Full compose rebuild completed and all FoodieGo containers came back up.

## Known limitations
- Existing repo-wide lint warnings remain in files outside Sprint 1 scope.
- Workspace typecheck failure is pre-existing and unrelated to these changes.
