/**
 * @foodiego/logging
 *
 * Pino-based structured JSON logger with automatic OpenTelemetry context injection.
 * Developer NEVER has to manually pass traceId/spanId — the SDK handles it.
 *
 * Logging Convention (enforced by this SDK):
 *   timestamp, severity, service, environment, traceId, spanId,
 *   requestId, eventId, message, exception.type, exception.message, duration
 *
 * Usage:
 *   import { createLogger } from '@foodiego/logging';
 *   const logger = createLogger();
 *   logger.info('Checkout created');           // traceId auto-injected
 *   logger.error({ err }, 'Payment failed');   // exception auto-extracted
 */

import pino from 'pino';
import { trace, context } from '@opentelemetry/api';

const SERVICE_NAME = process.env.SERVICE_NAME || 'unknown-service';
const ENVIRONMENT = process.env.DEPLOYMENT_ENVIRONMENT || process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

/**
 * Pino mixin that auto-injects OpenTelemetry trace context into every log line.
 * This is what makes `logger.info("msg")` automatically include traceId/spanId
 * without the developer having to remember.
 */
function otelMixin() {
  const activeSpan = trace.getSpan(context.active());
  if (!activeSpan) return {};

  const spanContext = activeSpan.spanContext();
  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
    traceFlags: spanContext.traceFlags,
  };
}

/**
 * PII Redaction
 * Automatically masks known PII fields in log payloads.
 * Fields: email, phone, password, token, authorization, credit_card, address
 * Also detects JWT-like strings (eyJ...) in any field value.
 */
const PII_FIELDS = new Set([
  'password', 'secret', 'pin', 'token', 'refreshToken', 'refresh_token',
  'authorization', 'credit_card', 'creditCard', 'cvv', 'ssn', 'cccd',
]);

const REDACT_FIELDS = new Set([
  'email', 'phone', 'address', 'fullAddress', 'full_address',
]);

function maskEmail(email) {
  if (typeof email !== 'string') return email;
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local[0]}***@${domain}`;
}

function maskPhone(phone) {
  if (typeof phone !== 'string') return phone;
  if (phone.length <= 4) return '***';
  return phone.slice(0, -4).replace(/./g, '*') + phone.slice(-4);
}

function redactPII(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    const lowerKey = key.toLowerCase();
    if (PII_FIELDS.has(lowerKey)) {
      result[key] = '[REDACTED]';
    } else if (lowerKey === 'email') {
      result[key] = maskEmail(result[key]);
    } else if (lowerKey === 'phone') {
      result[key] = maskPhone(result[key]);
    } else if (REDACT_FIELDS.has(lowerKey)) {
      result[key] = '[REDACTED]';
    } else if (typeof result[key] === 'string' && result[key].startsWith('eyJ')) {
      // Detect JWT-like strings
      result[key] = '[JWT_REDACTED]';
    }
  }
  return result;
}

/**
 * Creates a structured JSON logger for a FoodieGo service.
 *
 * @param {object} opts
 * @param {string} [opts.service] - Override service name (default: from ENV)
 * @param {string} [opts.level] - Override log level (default: from ENV)
 * @returns {import('pino').Logger}
 */
export function createLogger(opts = {}) {
  const serviceName = opts.service || SERVICE_NAME;
  const level = opts.level || LOG_LEVEL;

  const transport = ENVIRONMENT === 'development'
    ? { target: 'pino/file', options: { destination: 1 } } // stdout, can swap to pino-pretty
    : undefined; // JSON in production for Loki ingestion

  return pino({
    level,
    mixin: otelMixin,
    base: {
      service: serviceName,
      environment: ENVIRONMENT,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        // Use "severity" as the key name (Loki/GCP convention)
        return { severity: label.toUpperCase() };
      },
    },
    serializers: {
      err: pino.stdSerializers.err, // Auto-extracts exception.type, exception.message, stack
      req: pino.stdSerializers.req, // Extracts method, url, headers
      res: pino.stdSerializers.res, // Extracts statusCode
    },
    hooks: {
      // PII Redaction: automatically masks known PII fields before they are logged
      logMethod(inputArgs, method) {
        if (inputArgs.length >= 1 && typeof inputArgs[0] === 'object' && inputArgs[0] !== null) {
          inputArgs[0] = redactPII(inputArgs[0]);
        }
        return method.apply(this, inputArgs);
      },
    },
    ...(transport ? { transport } : {}),
  });
}

/**
 * Express middleware that creates a child logger with requestId bound.
 * Ensures every log inside a request handler has requestId without manual effort.
 *
 * @param {import('pino').Logger} logger
 * @returns {Function} Express middleware
 *
 * @example
 *   import { createLogger, requestLogger } from '@foodiego/logging';
 *   const logger = createLogger();
 *   app.use(requestLogger(logger));
 *   // In route handler: req.log.info('Processing order');
 */
export function requestLogger(logger) {
  return (req, res, next) => {
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();
    req.log = logger.child({ requestId });
    res.setHeader('x-request-id', requestId);

    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      req.log.info({
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
      }, 'HTTP Request completed');
    });

    next();
  };
}
