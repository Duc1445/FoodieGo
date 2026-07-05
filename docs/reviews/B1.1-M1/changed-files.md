# Changed Files

## `@foodiego/core` (New Package)
- `packages/core/package.json`
- `packages/core/src/index.js`
- `packages/core/src/config/index.js`
- `packages/core/src/errors/index.js`
- `packages/core/src/logger/index.js`
- `packages/core/src/middleware/correlation.middleware.js`
- `packages/core/src/middleware/error.middleware.js`
- `packages/core/src/response/index.js`
- `packages/core/src/validation/index.js`

## `restaurant-service`
- `apps/restaurant-service/package.json` (added `@foodiego/core` workspace dependency)
- `apps/restaurant-service/src/index.js` (refactored to use core middleware and `/api/v1` routes)
- `apps/restaurant-service/src/config/database.js` & `redis.js` (refactored to use core config)
- `apps/restaurant-service/src/modules/category/controllers/category.controller.js` (refactored to class methods & response envelope)
- `apps/restaurant-service/src/modules/category/services/category.service.js` (refactored to throw `NotFoundError`)
- `apps/restaurant-service/src/modules/menu-item/controllers/menu-item.controller.js` (refactored)
- `apps/restaurant-service/src/modules/restaurant/controllers/restaurant.controller.js` (refactored)
- `apps/restaurant-service/src/modules/restaurant/services/restaurant.service.js` (refactored to throw `NotFoundError`)
- `apps/restaurant-service/src/middlewares/auth.middleware.js` (refactored to use core Auth errors)
- `apps/restaurant-service/src/modules/health/` (Added health controller and routes)

## `gateway`
- `apps/gateway/src/index.js` (Updated all proxy routes to `/api/v1`)
