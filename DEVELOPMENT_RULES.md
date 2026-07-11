# FoodieGo Development Rules

These rules dictate the engineering approach for FoodieGo. They must be followed strictly by all developers and AI Agents.

## 1. MVP Mindset & Anti-Over-Engineering
- Do not create abstractions unless absolutely necessary.
- Avoid introducing complex state machines, unnecessary providers, or generic hooks if a simple direct implementation works.
- Only modify files within the scope of the current Sprint or Ticket. Do not refactor unrelated codebase layers just because they look messy.

## 2. Backend is the Single Source of Truth
- **Frontend State is a Projection**: The local Zustand store (e.g., `useCartStore`) should only cache and display data fetched from the backend. 
- **No Local Mutation Hacks**: Never artificially increment versions, quantities, or IDs on the frontend to bypass backend latency. Wait for the API response and map it to the local state.
- **Cart Consistency**: If the backend returns an unknown item, the frontend must safely degrade by fetching the entire cart again. It must never drop items silently.

## 3. Thin Service Layer
- **No JWT Decoding on Client**: The frontend should not parse JWTs to extract information like `user_id`. Instead, read it from the pre-populated auth state (`useAuthStore`) or rely on backend introspection.
- **API Interceptors**: `api.ts` handles all cross-cutting concerns like attaching the token and `X-User-Id`. Services must not manually attach these.
- **Error Handling**: 401s must immediately clear local storage and reset auth state. 500s or Network errors should keep the current persistent UI state to minimize user disruption.

## 4. Pure Utilities
- **`pricing.ts`**: Must remain completely isolated. It should contain pure functions representing the absolute source of truth for pricing calculations. It must not import `cart.api.ts` or Zustand stores.

## 5. UI and UX Quality
- Avoid blocking the entire UI during network requests. Use granular loading states (e.g., `pendingItemIds` for cart items).
- Use Radix UI and TailwindCSS effectively from the `packages/ui` workspace. Do not build custom UI components if a shared component already exists.
- Forbidden patterns: `window.alert`, `window.confirm`, `TODO`, `FIXME`, `console.log`.

## AI Agent Workflow

Before implementing any feature:

1. Read SYSTEM_CONTEXT.md
2. Read relevant arc42 architecture docs
3. Read related ADRs
4. Read package CONTEXT.md
5. Create implementation plan
6. Execute
7. Update documentation
8. Commit and push
