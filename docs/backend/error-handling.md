# Error Handling

## 1. Global Error Handler
All unhandled exceptions must be caught by a global middleware to prevent crashing the Node.js process and leaking stack traces.

## 2. Standardized Responses
Return consistent error structures (similar to ASP.NET's ProblemDetails):
```json
{
  "type": "https://foodiego.com/errors/not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "Order ID 12345 does not exist."
}
```
