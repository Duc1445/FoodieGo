import { validationResult } from 'express-validator';
import { ValidationError } from '../errors/index.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Transform express-validator errors into our standardized ValidationError details
    const details = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value
    }));
    
    return next(new ValidationError('Invalid request parameters', details));
  }
  next();
};
