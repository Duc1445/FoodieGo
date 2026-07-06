// ╔══════════════════════════════════════════════════════════════════════╗
// ║  IMPORTANT: Tracing MUST be initialized before any other imports. ║
// ╚══════════════════════════════════════════════════════════════════════╝
import { initTracing } from '@foodiego/tracing';
initTracing();

import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { MetricsRegistry } from '@foodiego/metrics';
import { createLogger, requestLogger } from '@foodiego/logging';

const app = express();
const PORT = process.env.PORT || 3005;

// ─── Platform SDKs ─────────────────────────────────────────────────────────
const logger = createLogger({ service: 'payment-service' });
const metrics = new MetricsRegistry('payment-service');

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

// ─── Observability Middleware ──────────────────────────────────────────────
app.use(requestLogger(logger)); // Structured logging with auto traceId
app.use(metrics.httpMiddleware()); // Prometheus metrics (standardized)

// ─── Routes ────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'payment-service' }));
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', metrics.contentType);
  res.end(await metrics.getMetrics());
});

// ─── Error Handler ─────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  req.log?.error({ err }, 'Unhandled error');
  res.status(err.statusCode || 500).json({ success: false, message: err.message });
});

// ─── Start ──────────────────────────────────────────────────────────────────
import { startConsumers } from './workers/consumer.worker.js';
import { startDispatcher } from './workers/dispatcher.worker.js';

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    logger.info({ port: PORT }, 'Payment Service started');
    await startDispatcher();
    await startConsumers();
  });
}

export { logger, metrics };
export default app;
