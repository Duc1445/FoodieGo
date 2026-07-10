# Sprint 1 Task Notes

## Scope completed
- Fixed customer login redirect so it lands on the customer portal at `/`.
- Removed the route collision between customer home and auth pages.
- Kept merchant and admin auth routes on their own paths.
- Added shared auth-session helpers for JWT validation and redirect paths.
- Converted Sprint 1 dashboards to skeleton-only layouts.
- Kept shared mocks limited to analytics only.

## Verification
- `pnpm --filter web build` ✅
- `pnpm lint` ✅ with pre-existing warnings outside Sprint 1 scope
- `pnpm typecheck` ⚠️ fails in workspace packages because several package `tsconfig.json` files are missing
- `pnpm build` ✅
- `docker compose up --build -d web` ✅

## Notes
- Live test accounts use `Admin@123`.
- Customer, merchant, and admin login all now succeed against the live stack.
