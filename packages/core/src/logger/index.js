import pino from 'pino';

export const createLogger = (serviceName) => {
  return pino({
    level: process.env.LOG_LEVEL || 'info',
    base: {
      service: serviceName,
      version: process.env.npm_package_version || '1.0.0'
    },
    formatters: {
      level: (label) => ({ level: label }),
    },
    messageKey: 'message',
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
    // In production, we log as JSON.
    transport: process.env.NODE_ENV !== 'production' ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
      }
    } : undefined
  });
};
