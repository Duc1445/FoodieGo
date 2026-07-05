export const successResponse = (res, data, pagination = null) => {
  const reqId = res.locals.correlationId || 'unknown';
  
  const payload = {
    success: true,
    data,
    request: {
      id: reqId,
      timestamp: new Date().toISOString()
    },
    error: null
  };

  if (pagination) {
    payload.pagination = pagination;
  }

  return res.json(payload);
};

export const errorResponse = (res, error) => {
  const reqId = res.locals.correlationId || 'unknown';
  const statusCode = error.statusCode || 500;
  
  const payload = {
    success: false,
    request: {
      id: reqId,
      timestamp: new Date().toISOString()
    },
    error: {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: error.details || null
    }
  };

  // Only include stack trace in development
  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    payload.error.stack = error.stack;
  }

  return res.status(statusCode).json(payload);
};
