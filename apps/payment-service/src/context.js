import { metrics as m, logger as l } from '@foodiego/platform-sdk';
export const logger = l.createLogger({ service: 'payment-service' });
export const metrics = new m.MetricsRegistry('payment-service');
