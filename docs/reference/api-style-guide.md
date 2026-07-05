# API Style Guide

All FoodieGo microservices must strictly adhere to this API style guide to ensure a consistent developer experience across the monorepo.

## 1. Versioning
- **Rule:** Every API endpoint must be versioned.
- **Pattern:** `/api/v1/[resource]`
- **Example:** `/api/v1/restaurants`

## 2. Resource Naming
- **Rule:** Use plural nouns for resources, not verbs.
- **Good:** `GET /api/v1/restaurants`
- **Bad:** `GET /api/v1/getRestaurants` or `GET /api/v1/restaurant`

## 3. Standard Envelope
All successful and failed responses must be wrapped in a standardized envelope provided by `@foodiego/core/response`.

**Success Payload:**
```json
{
  "success": true,
  "data": { ... },
  "pagination": { "page": 1, "limit": 20, "total": 100 }, 
  "request": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "timestamp": "2023-10-27T10:00:00Z"
  },
  "error": null
}
```
*(Note: `pagination` is omitted if not applicable).*

**Error Payload:**
```json
{
  "success": false,
  "request": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "timestamp": "2023-10-27T10:00:00Z"
  },
  "error": {
    "code": "RESTAURANT_NOT_FOUND",
    "message": "Restaurant with ID 99 not found",
    "details": null
  }
}
```

## 4. HTTP Status Codes
- `200 OK`: Successful read or update.
- `201 Created`: Successful creation.
- `400 Bad Request`: Client error (e.g., malformed request).
- `401 Unauthorized`: Missing or invalid authentication token.
- `403 Forbidden`: Authenticated, but lacks required permissions (RBAC).
- `404 Not Found`: Resource does not exist.
- `409 Conflict`: Resource already exists or conflict in state.
- `422 Unprocessable Entity`: Validation error on payload fields.
- `500 Internal Server Error`: Unexpected infrastructure/code failure.

## 5. Pagination, Filtering, and Sorting
- **Pagination:** Always use `page` and `limit` query parameters.
- **Sorting:** Use `sort` query parameter. Prefix with `-` for descending. (e.g., `?sort=-rating`).
- **Filtering:** Pass fields directly as query parameters (e.g., `?is_active=true`).

## 6. Observability Headers
- **`X-Correlation-ID`:** Gateway automatically generates or propagates this header. All downstream logs and error traces must include it.
