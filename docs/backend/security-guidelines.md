# Security Guidelines

## 1. Input Validation
All incoming DTOs must be validated at the boundary (e.g., using Zod/Joi) before hitting the Service layer.

## 2. Authentication
JWTs are verified at the Gateway or Service boundary. Services trust the `X-User-Id` header.

## 3. Secrets Management
Never hardcode secrets. Use environment variables exclusively.
