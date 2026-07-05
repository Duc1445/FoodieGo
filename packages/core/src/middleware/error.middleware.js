import { AppError } from '../errors/index.js';
import { errorResponse } from '../response/index.js';

export const errorHandlerMiddleware = (logger) => (err, req, res, next) => {
  let customError = err;

  // If the error isn't an instance of our AppError, wrap it
  if (!(err instanceof AppError)) {
    // Determine if it's a known error (e.g., from a database driver)
    customError = new AppError(
      err.message || 'Internal Server Error',
      err.status || 500,
      'UNKNOWN_ERROR',
      false
    );
    // Preserve the original stack
    customError.stack = err.stack;
  }

  // Log the error
  if (logger) {
    if (customError.isOperational) {
      logger.warn({ err: customError }, customError.message);
    } else {
      logger.error({ err: customError }, 'Unexpected non-operational error occurred');
    }
  }

  // Send the error response
  return errorResponse(res, customError);
};
