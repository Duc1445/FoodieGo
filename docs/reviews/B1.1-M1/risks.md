# Risks

1. **Tight Coupling via `@foodiego/core`:**
   - *Risk:* Since all services depend on `@foodiego/core`, a breaking change in this library will break the entire monorepo.
   - *Mitigation:* Treat `@foodiego/core` as a high-stability, strictly version-controlled library. Major refactors must go through careful code review and integration testing across all services.

2. **Developer Adoption:**
   - *Risk:* Developers might bypass the core library and use `console.log` or manual `res.status(500).json(...)` out of habit.
   - *Mitigation:* Enforce the architecture via ESLint rules (e.g., `no-console`) and reject Pull Requests that violate the Dependency Rules.

3. **Performance Overhead of Envelope/Middlewares:**
   - *Risk:* Adding layers of middleware (validation, correlation IDs, formatting) slightly increases latency.
   - *Mitigation:* Use lightweight libraries (Pino) and optimize JSON serialization. The tradeoff for Observability is worth the sub-millisecond overhead.
