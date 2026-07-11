# API Design Guidelines

## 1. RESTful Principles
- Use standard HTTP methods: GET, POST, PUT, PATCH, DELETE.
- Resources should be nouns, not verbs (e.g., `/orders`, not `/createOrder`).

## 2. DTOs and Domain Models
- Never expose raw database entities to the client. Always map to Data Transfer Objects (DTOs).

## 3. Pagination & Filtering
- Standardize query parameters: `?page=1&limit=10&sort=-createdAt`.
