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

// Routes
import cartRoutes from './modules/cart/routes/cart.routes.js';
import checkoutRoutes from './modules/checkout/routes/checkout.routes.js';
import deliveryRoutes from './modules/delivery/routes/delivery.routes.js';
import promotionRoutes from './routes/promotion.routes.js';

const app = express();
const PORT = process.env.PORT || 3003;

// ─── Platform SDKs ─────────────────────────────────────────────────────────
const logger = createLogger({ service: 'order-service' });
const metrics = new MetricsRegistry('order-service');

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

// ─── Observability Middleware ──────────────────────────────────────────────
app.use(requestLogger(logger));       // Structured logging with auto traceId
app.use(metrics.httpMiddleware());    // Prometheus metrics (standardized)

// ─── Routes ────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'order-service' }));
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', metrics.contentType);
  res.end(await metrics.getMetrics());
});

app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', checkoutRoutes);
// app.use('/api/v1/delivery', deliveryRoutes);
app.use('/api/v1/promotions', promotionRoutes);

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
    logger.info({ port: PORT }, 'Order Service started');
    await startDispatcher();
    await startConsumers();
  });
}

export { logger, metrics };
export default app;
