export class AppError extends Error {
  constructor(message, statusCode, code, isOperational = true, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class DomainError extends AppError {
  constructor(message, code = 'DOMAIN_ERROR', details = null) {
    super(message, 400, code, true, details);
  }
}

export class NotFoundError extends DomainError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND', details = null) {
    super(message, code, details);
    this.statusCode = 404;
  }
}

export class RestaurantNotFoundError extends NotFoundError {
  constructor(restaurantId) {
    super(`Restaurant with ID ${restaurantId} not found`, 'RESTAURANT_NOT_FOUND', { restaurantId });
  }
}

export class MenuItemUnavailableError extends DomainError {
  constructor(itemId) {
    super(`Menu item ${itemId} is unavailable`, 'MENU_ITEM_UNAVAILABLE', { itemId });
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 422, 'VALIDATION_ERROR', true, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR', true);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR', true);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details = null) {
    super(message, 409, 'CONFLICT_ERROR', true, details);
  }
}

export class CartConflictError extends ConflictError {
  constructor(currentRestaurant, incomingRestaurant, restaurantId) {
    super(
      `Cannot add items from a different restaurant. Current: ${currentRestaurant}, Incoming: ${incomingRestaurant}`,
      {
        code: 'CART_DIFFERENT_RESTAURANT',
        restaurantId,
        currentRestaurant,
        incomingRestaurant
      }
    );
    this.code = 'CART_DIFFERENT_RESTAURANT';
  }
}

export class InfrastructureError extends AppError {
  constructor(message, code = 'INFRASTRUCTURE_ERROR', details = null) {
    super(message, 500, code, false, details);
  }
}

export class DatabaseError extends InfrastructureError {
  constructor(message = 'Database operation failed', details = null) {
    super(message, 'DATABASE_ERROR', details);
  }
}

export class RedisError extends InfrastructureError {
  constructor(message = 'Redis operation failed', details = null) {
    super(message, 'REDIS_ERROR', details);
  }
}
