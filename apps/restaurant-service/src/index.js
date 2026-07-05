// ╔══════════════════════════════════════════════════════════════════════╗
// ║  IMPORTANT: Tracing MUST be initialized before any other imports. ║
// ╚══════════════════════════════════════════════════════════════════════╝
import { initTracing } from '@foodiego/tracing';
initTracing();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { MetricsRegistry } from '@foodiego/metrics';
import { createLogger as createPlatformLogger, requestLogger } from '@foodiego/logging';

// Core imports (backward compatibility — correlationId is now handled by requestLogger)
import { createLogger, correlationIdMiddleware, errorHandlerMiddleware, config } from '@foodiego/core';

dotenv.config();

const app = express();
const PORT = config.server.port || 3002;

// ─── Platform SDKs ─────────────────────────────────────────────────────────
const logger = createPlatformLogger({ service: 'restaurant-service' });
const metrics = new MetricsRegistry('restaurant-service');

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(correlationIdMiddleware);

// ─── Observability Middleware ──────────────────────────────────────────────
app.use(requestLogger(logger));       // Structured logging with auto traceId
app.use(metrics.httpMiddleware());    // Prometheus metrics (standardized)

// ─── Routes ────────────────────────────────────────────────────────────────
import categoryRoutes from './modules/category/routes/category.routes.js';
import restaurantRoutes from './modules/restaurant/routes/restaurant.routes.js';
import healthRoutes from './modules/health/health.routes.js';

app.use('/', healthRoutes); // Mount at root for k8s /health, /ready, /live
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', metrics.contentType);
  res.end(await metrics.getMetrics());
});

app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/restaurants', restaurantRoutes);

// ─── Error Handler ─────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  req.log?.error({ err }, 'Unhandled error');
  res.status(err.statusCode || 500).json({ success: false, message: err.message });
});

// ─── Start ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Restaurant Service started');
  });
}

export default app;
