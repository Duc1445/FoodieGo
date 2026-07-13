export class SchemaValidationError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = 'SchemaValidationError';
    this.errors = errors; // AJV error array
  }
}

export class BusinessRuleViolation extends Error {
  constructor(message, reason) {
    super(message);
    this.name = 'BusinessRuleViolation';
    this.reason = reason;
  }
}

export class InfrastructureError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'InfrastructureError';
    this.originalError = originalError;
  }
}
