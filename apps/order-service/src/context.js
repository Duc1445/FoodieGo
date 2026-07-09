import { metrics as m, logger as l } from '@foodiego/platform-sdk';
export const logger = l.createLogger({ service: 'order-service' });
export const metrics = new m.MetricsRegistry('order-service');
