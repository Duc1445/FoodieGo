import { initTracing } from '@foodiego/tracing';
initTracing();

const appModule = await import('./app.js');

export const logger = appModule.logger;
export const metrics = appModule.metrics;
export default appModule.default;
