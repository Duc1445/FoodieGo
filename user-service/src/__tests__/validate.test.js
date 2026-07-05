// Unit tests for validate.middleware.js
import { jest } from '@jest/globals';

const { validate } = await import('../middlewares/validate.middleware.js');

// Create a mock validationResult
jest.unstable_mockModule('express-validator', () => ({
  validationResult: jest.fn(),
  body: jest.fn(() => ({
    isEmail: jest.fn().mockReturnThis(),
    normalizeEmail: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    trim: jest.fn().mockReturnThis(),
    notEmpty: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    isIn: jest.fn().mockReturnThis(),
    isMobilePhone: jest.fn().mockReturnThis(),
  })),
}));

describe('Validate Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should call next if no validation errors', async () => {
    const { validationResult } = await import('express-validator');
    validationResult.mockReturnValue({ isEmpty: () => true, array: () => [] });

    // Re-import to get fresh module with mocked dependency
    const { validate: freshValidate } = await import('../middlewares/validate.middleware.js');
    freshValidate(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
