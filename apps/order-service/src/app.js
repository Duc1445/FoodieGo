// Tracing initialized in index.js
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { requestLogger } from '@foodiego/logging';

// Routes
import cartRoutes from './modules/cart/routes/cart.routes.js';
import checkoutRoutes from './modules/checkout/routes/checkout.routes.js';
import orderRoutes from './modules/order/routes/order.routes.js';
import deliveryRoutes from './modules/delivery/routes/delivery.routes.js';
import promotionRoutes from './routes/promotion.routes.js';
import adminRoutes from './routes/admin.routes.js';
import supportRoutes from './modules/support/support.routes.js';

const app = express();
const PORT = process.env.PORT || 3003;

import { logger } from './config/logger.js';
import { metrics } from './config/metrics.js';
// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

// ─── Observability Middleware ──────────────────────────────────────────────
app.use(requestLogger(logger)); // Structured logging with auto traceId
app.use(metrics.httpMiddleware()); // Prometheus metrics (standardized)

// ─── Routes ────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'order-service' }));
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', metrics.contentType);
  res.end(await metrics.getMetrics());
});

const ordersRouter = express.Router();
ordersRouter.use('/', checkoutRoutes);
ordersRouter.use('/', orderRoutes);

app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/delivery', deliveryRoutes);
app.use('/api/v1/promotions', promotionRoutes);
app.use('/api/v1', adminRoutes);
app.use('/api/v1/support', supportRoutes);

// ─── Error Handler ─────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  req.log?.error({ err }, 'Unhandled error');
  res.status(err.statusCode || 500).json({ success: false, message: err.message });
});

// ─── Start ──────────────────────────────────────────────────────────────────
import { startConsumers } from './workers/consumer.worker.js';
import { startDispatcher } from './workers/dispatcher.worker.js';
import { runTimeoutSweep } from './workers/saga-timeout.worker.js';
import { eventValidator } from '@foodiego/contracts';

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    logger.info({ port: PORT }, 'Order Service started');

    // Initialize Schema Validator
    eventValidator.init();

    await startDispatcher();
    await startConsumers();

    // Start Saga Timeout Sweep periodically
    setInterval(() => {
      runTimeoutSweep().catch((err) => {
        logger.error('Unhandled error in Saga Timeout Worker', err);
      });
    }, 60000); // Check every minute
  });
}

export default app;
