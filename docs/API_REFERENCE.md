# API Reference

## Authentication
All protected endpoints require a Bearer token:
`Authorization: Bearer <jwt_token>`

## Identity Service
### `POST /api/auth/register`
- **Body:** `{ "email": "user@example.com", "password": "password123", "role": "customer" }`
- **Response:** `201 Created` - `{ "message": "User registered" }`

### `POST /api/auth/login`
- **Body:** `{ "email": "user@example.com", "password": "password123" }`
- **Response:** `200 OK` - `{ "token": "...", "user": { ... } }`

## Restaurant Service
### `GET /api/restaurants`
- **Query:** `?page=1&limit=10`
- **Response:** `200 OK` - `[ { "id": 1, "name": "Pizza Hut" } ]`

### `GET /api/restaurants/:id/menu`
- **Response:** `200 OK` - `[ { "id": 101, "name": "Margherita", "price": 10.99 } ]`

## Order Service
### `POST /api/orders`
- **Auth:** Required
- **Body:** `{ "restaurantId": 1, "items": [ { "itemId": 101, "quantity": 2 } ] }`
- **Response:** `201 Created` - `{ "orderId": "ord_123", "status": "PENDING" }`

### `GET /api/orders/:id`
- **Auth:** Required
- **Response:** `200 OK` - `{ "orderId": "ord_123", "status": "CONFIRMED" }`

## Payment Service
### `POST /api/payments`
- **Auth:** Required
- **Body:** `{ "orderId": "ord_123", "amount": 21.98, "method": "CREDIT_CARD" }`
- **Response:** `200 OK` - `{ "paymentId": "pay_123", "status": "SUCCESS" }`

## Inventory Service
### `POST /api/inventory/reserve`
- **Auth:** Internal
- **Body:** `{ "orderId": "ord_123", "items": [ { "itemId": 101, "quantity": 2 } ] }`
- **Response:** `200 OK` - `{ "status": "RESERVED" }`

## Error Codes
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource does not exist
- `500 Internal Server Error` - Server encountered an error
