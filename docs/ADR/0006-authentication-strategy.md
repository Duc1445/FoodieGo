# 0006. Authentication strategy

## Status
Accepted

## Context
Need a secure, stateless authentication mechanism.

## Decision
Use JWTs issued by the Identity Service. The API Gateway forwards requests and can perform initial token validation, injecting `X-User-Id`. The frontend MUST NOT decode JWTs.

## Consequences
- Services trust the `X-User-Id` header if originating from the Gateway.
- Frontend relies on `useAuthStore` instead of parsing tokens.
