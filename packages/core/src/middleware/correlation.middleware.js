import { v4 as uuidv4 } from 'uuid';

export const correlationIdMiddleware = (req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  req.correlationId = correlationId;
  res.locals.correlationId = correlationId;
  
  // Set the header for the response so clients can track it
  res.setHeader('X-Correlation-ID', correlationId);

  // If using pino-http or similar, we inject the correlationId into req.log
  if (req.log) {
    req.log = req.log.child({ requestId: correlationId, sessionId: req.headers['x-session-id'] || 'anonymous', userId: req.user?.id || 'anonymous' });
  }

  next();
};
