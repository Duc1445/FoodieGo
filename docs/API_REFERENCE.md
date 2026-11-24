# API Reference

## 1. Conventions
- Base entry point for users: `http://localhost:3000` (gateway)
- Protected endpoints require `Authorization: Bearer <jwt>`
- Checkout requires `Idempotency-Key`
- JSON responses commonly follow `{ success, message?, data? }`
- Validation failures usually return `400`
- Authorization failures return `401` or `403`
- Missing resources usually return `404`
- Duplicate and constraint issues can return `409`

## 2. Gateway Endpoints
| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | No | Gateway health check. |
| GET | `/metrics` | No | Prometheus metrics. |
| GET | `/api/v1/admin/dashboard` | Yes, admin | Aggregated dashboard data from identity, restaurant, and order services. |
| POST | `/api/analytics/events` | No | Lightweight analytics event sink. |

The gateway proxies the following public service namespaces:
- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/admin/users`
- `/api/v1/admin/merchants`  Note: currently routed to identity service, but there is no dedicated mounted handler in the service entrypoint.
- `/api/v1/admin/restaurants`
- `/api/v1/admin/orders`
- `/api/v1/admin/stats`
- `/api/v1/categories`
- `/api/v1/restaurants`
- `/api/v1/menus`
- `/api/v1/orders`
- `/api/v1/cart`
- `/api/v1/delivery`
- `/api/v1/promotions`
- `/api/v1/payments`
- `/api/v1/reviews`
- `/api/v1/support`

## 3. Identity Service
Base URL: `http://localhost:3001`

### Public auth
| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | No | `{ email, password, full_name, role? }` | `201` with registered user payload. |
| POST | `/api/v1/auth/login` | No | `{ email, password }` | `200` with token and user data. |
| GET | `/health` | No | None | Health payload. |
| GET | `/metrics` | No | None | Prometheus metrics. |

### Authenticated profile
| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/auth/profile` | Yes | None | Current user profile. |
| PUT | `/api/v1/auth/profile` | Yes | `{ full_name?, phone?, address? }` | Updated profile. |

### Address management
| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/users/:id/addresses` | Yes, owner or admin | None | Address list for the user. |
| POST | `/api/v1/users/:id/addresses` | Yes, owner or admin | Address payload | Created address. |
| PUT | `/api/v1/users/:id/addresses/:addressId` | Yes, owner or admin | Address payload | Updated address. |
| DELETE | `/api/v1/users/:id/addresses/:addressId` | Yes, owner or admin | None | Deleted address confirmation. |

### Admin user management
| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/admin/users` | Yes, admin | Optional `role`, `page`, `limit` | Paginated user list. |
| DELETE | `/api/v1/admin/users/:id` | Yes, admin | None | `200` or `404`. |
| GET | `/api/v1/admin/users/pending` | Yes, admin | Optional `role=merchant|driver` | Pending approvals. |
| PATCH | `/api/v1/admin/users/:id/approve` | Yes, admin | None | Approved user object. |
| PATCH | `/api/v1/admin/users/:id/reject` | Yes, admin | `{ reason }` | Rejected user object. |
| GET | `/api/v1/admin/stats` | Yes, admin | None | User stats summary. |

### Defined but not mounted
`apps/identity-service/src/routes/employee.routes.js` defines CRUD endpoints for employees, but the current service entrypoint does not mount that router. Those routes are therefore not publicly reachable in the current runtime.

## 4. Restaurant Service
Base URL: `http://localhost:3002`

### Health and metrics
| Method | Path | Auth | Response |
| --- | --- | --- | --- |
| GET | `/health/live` | No | Liveness status. |
| GET | `/health/ready` | No | Readiness status. |
| GET | `/health` | No | Combined health payload. |
| GET | `/health/version` | No | Version payload. |
| GET | `/metrics` | No | Prometheus metrics. |

### Categories
| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/categories` | No | None | Category list. |
| GET | `/api/v1/categories/:id` | No | None | Category detail. |
| POST | `/api/v1/categories` | Yes, admin | `{ name, description?, image_url? }` | Created category. |
| PUT | `/api/v1/categories/:id` | Yes, admin | Category update payload | Updated category. |
| DELETE | `/api/v1/categories/:id` | Yes, admin | None | Deleted flag payload. |

### Restaurants
| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/restaurants` | No | Pagination and filter query params | Restaurant list. |
| GET | `/api/v1/restaurants/:id` | No | None | Restaurant detail. |
| GET | `/api/v1/restaurants/:id/categories` | No | None | Categories for restaurant. |
| GET | `/api/v1/restaurants/:id/menu` | No | None | Menu for restaurant. |
| GET | `/api/v1/admin/restaurants` | Yes, admin | `page`, `limit` | Admin restaurant list. |
| GET | `/api/v1/admin/restaurants/pending` | Yes, admin | None | Pending restaurants. |
| GET | `/api/v1/admin/restaurants/stats` | Yes, admin | None | Restaurant stats summary. |
| PATCH | `/api/v1/admin/restaurants/:id/approve` | Yes, admin | None | Approved restaurant. |
| PATCH | `/api/v1/admin/restaurants/:id/reject` | Yes, admin | None | Rejected restaurant. |
| PATCH | `/api/v1/admin/restaurants/:id/status` | Yes, admin | None | Status toggle result. |

### Menu items
| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/menus/items` | No | `q`, `page`, `limit` | Menu item list. |
| GET | `/api/v1/menus/items/:id` | No | None | Menu item detail. |
| GET | `/api/v1/menus/merchant/items` | Yes, merchant | None | Merchant menu items. |
| POST | `/api/v1/menus/items` | Yes, admin or merchant | Create payload | Created menu item. |
| PUT | `/api/v1/menus/items/:id` | Yes, admin or merchant | Update payload | Updated menu item. |
| DELETE | `/api/v1/menus/items/:id` | Yes, admin or merchant | None | Soft delete confirmation. |

### Reviews
| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/reviews` | Yes | `{ restaurantId, orderId?, rating, comment? }` | Created review. |
| GET | `/api/v1/reviews/:id` | No | None | Review detail. |
| GET | `/api/v1/reviews/order/:orderId` | Yes | None | Review for order. |
| GET | `/api/v1/reviews/restaurant/:restaurantId` | No | `page`, `limit`, `sortBy`, `sortOrder` | Review list. |
| GET | `/api/v1/reviews/user/:userId` | Yes, owner or admin | `page`, `limit` | User review list. |
| PUT | `/api/v1/reviews/:id` | Yes, owner | `{ rating?, comment? }` | Updated review. |
| DELETE | `/api/v1/reviews/:id` | Yes, owner or admin | None | Delete confirmation. |
| GET | `/api/v1/reviews/restaurant/:restaurantId/rating` | No | None | Rating summary. |

## 5. Order Service
Base URL: `http://localhost:3003`

### Health and metrics
| Method | Path | Auth | Response |
| --- | --- | --- | --- |
| GET | `/health` | No | Health payload. |
| GET | `/metrics` | No | Prometheus metrics. |

### Cart
| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/cart` | Yes | None | Current cart. |
| PUT | `/api/v1/cart/items` | Yes | Item payload | Added or updated cart item. |
| PATCH | `/api/v1/cart/items/:id` | Yes | Quantity payload | Quantity update. |
| DELETE | `/api/v1/cart/items/:id` | Yes | None | Remove item confirmation. |
| DELETE | `/api/v1/cart` | Yes | None | Clear cart confirmation. |

### Checkout and orders
| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/orders/checkout` | Yes | Checkout payload + `Idempotency-Key` | `201` order result. |
| GET | `/api/v1/orders` | Yes | None | Customer order history. |
| GET | `/api/v1/orders/:id` | Yes | None | Order detail. |
| GET | `/api/v1/orders/merchant` | Yes, merchant or admin | `restaurant_id` for admin | Merchant orders. |
| GET | `/api/v1/orders/merchant/stats` | Yes, merchant or admin | `restaurant_id` for admin | Merchant stats. |
| PATCH | `/api/v1/orders/:id/status` | Yes, merchant or admin | `{ status }` | Status update result. |

### Delivery
| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/delivery` | Yes, driver or admin | Optional filters | Delivery list. |
| GET | `/api/v1/delivery/stats` | Yes, driver | None | Driver stats. |
| GET | `/api/v1/delivery/order/:orderId` | Yes | None | Delivery by order. |
| PATCH | `/api/v1/delivery/:id/accept` | Yes, driver | None | Accepted delivery. |
| PATCH | `/api/v1/delivery/:id/status` | Yes, driver | `{ status }` | Updated delivery status. |

### Promotions
| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/promotions` | Yes, admin | None | All promotions. |
| GET | `/api/v1/promotions/pending` | Yes, admin | None | Pending merchant vouchers. |
| GET | `/api/v1/promotions/merchant` | Yes, merchant | None | Merchant vouchers. |
| GET | `/api/v1/promotions/active` | No | `restaurantId` | Active promotions. |
| POST | `/api/v1/promotions/validate` | No | `{ code, orderValue, restaurantId? }` | Validation result. |
| POST | `/api/v1/promotions` | Yes, admin | Platform promotion payload | Created promotion. |
| POST | `/api/v1/promotions/merchant` | Yes, merchant | Voucher payload | Submitted voucher. |
| PATCH | `/api/v1/promotions/:id/approve` | Yes, admin | None | Approved voucher. |
| PATCH | `/api/v1/promotions/:id/reject` | Yes, admin | `{ reason }` | Rejected voucher. |
| PUT | `/api/v1/promotions/:id` | Yes | Update payload | Promotion update. |
| DELETE | `/api/v1/promotions/:id` | Yes | None | Promotion deletion. |

### Support
| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/support` | Yes | `{ issue_type, description, ... }` | Created ticket. |
| GET | `/api/v1/support` | Yes, admin | `status`, `priority`, `page`, `limit` | Ticket list. |
| GET | `/api/v1/support/stats` | Yes, admin | None | Ticket stats. |
| GET | `/api/v1/support/:id` | Yes, admin | None | Ticket detail. |
| PATCH | `/api/v1/support/:id` | Yes, admin | Status and assignment payload | Ticket update. |

### Admin routes
| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/admin/orders` | Yes, admin | `status`, `page`, `limit` | Order list. |
| GET | `/api/v1/admin/orders/:id` | Yes, admin | None | Order detail. |
| GET | `/api/v1/admin/stats` | Yes, admin | None | Order and support summary. |

## 6. Payment Service
Base URL: `http://localhost:3005`

| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| GET | `/health` | No | None | Health payload. |
| GET | `/metrics` | No | None | Prometheus metrics. |
| POST | `/webhook/payment` | No, but signed | Raw JSON body plus `x-signature`, `x-timestamp`, `x-webhook-id`, optional `x-key-id` | `200 OK` if accepted, `403` if validation fails. |

Webhook notes:
- The controller reads the raw request body.
- Missing headers, invalid timestamps, or signature mismatches are rejected with `403`.
- Duplicate webhooks are persisted in `webhook_inbox` and skipped.

## 7. Inventory Service
Base URL: `http://localhost:3004`

| Method | Path | Auth | Response |
| --- | --- | --- | --- |
| GET | `/health` | No | Health payload. |
| GET | `/metrics` | No | Prometheus metrics. |

This service is event-driven. It consumes `OrderPendingReservation` and publishes inventory reservation outcomes via RabbitMQ and outbox tables.

## 8. Food Service
`apps/food-service` is a projection service and does not expose an HTTP API in the current codebase.

It maintains:
- food search projections
- availability projections
- event replay and rebuild scripts

## 9. Common Error Responses
| Code | Meaning |
| --- | --- |
| 400 | Validation error, missing required field, or invalid business input. |
| 401 | Missing or invalid JWT. |
| 403 | Role or ownership check failed, or webhook verification failed. |
| 404 | Resource not found. |
| 409 | Duplicate record or relational constraint conflict. |
| 422 | Not used in the current router patterns, but may appear in downstream libraries. |
| 500 | Unexpected server error. |
| 503 | Gateway proxy target unavailable. |

## 10. Example Requests
### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@foodiego.com","password":"123456"}'
```

### Checkout
```bash
curl -X POST http://localhost:3000/api/v1/orders/checkout \
  -H "Authorization: Bearer <jwt>" \
  -H "Idempotency-Key: demo-checkout-001" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"menuItemId":"...","quantity":2}],"restaurantId":"..."}'
```

### Payment webhook
```bash
curl -X POST http://localhost:3005/webhook/payment \
  -H "Content-Type: application/json" \
  -H "x-signature: <hex-hmac>" \
  -H "x-timestamp: <unix-seconds>" \
  -H "x-webhook-id: <uuid>" \
  --data-binary '{"id":"evt_123","data":{"reference":"pay_123"}}'
```
