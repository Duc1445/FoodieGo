// ╔══════════════════════════════════════════════════════════════════════╗
// ║  IMPORTANT: Tracing MUST be initialized before any other imports. ║
// ╚══════════════════════════════════════════════════════════════════════╝
import { initTracing } from '@foodiego/tracing';
initTracing();

import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { MetricsRegistry } from '@foodiego/metrics';
import { createLogger, requestLogger } from '@foodiego/logging';
import { setupSwagger } from './config/swagger.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Platform SDKs ─────────────────────────────────────────────────────────
const logger = createLogger({ service: 'gateway' });
const metrics = new MetricsRegistry('gateway');

setupSwagger(app);

// ─── Security Middleware ───────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }));

// ─── Rate Limiting ─────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(limiter);

// ─── Observability Middleware ──────────────────────────────────────────────
app.use(requestLogger(logger));       // Structured logging with auto traceId
app.use(metrics.httpMiddleware());    // Prometheus metrics (standardized)

// ─── Health & Metrics ──────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'gateway' }));

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', metrics.contentType);
  res.end(await metrics.getMetrics());
});

// ─── Proxy Routes ──────────────────────────────────────────────────────────
const proxyOptions = (target) => ({
  target,
  changeOrigin: true,
  on: {
    error: (err, _req, res) => {
      logger.error({ err, target }, 'Proxy error');
      res.status(503).json({ success: false, message: 'Service unavailable' });
    },
  },
});

app.use('/api/v1/auth', createProxyMiddleware(proxyOptions(process.env.IDENTITY_SERVICE_URL)));
app.use('/api/v1/users', createProxyMiddleware(proxyOptions(process.env.IDENTITY_SERVICE_URL)));
app.use('/api/v1/categories', createProxyMiddleware(proxyOptions(process.env.RESTAURANT_SERVICE_URL)));
app.use('/api/v1/restaurants', createProxyMiddleware(proxyOptions(process.env.RESTAURANT_SERVICE_URL)));
app.use('/api/v1/orders', createProxyMiddleware(proxyOptions(process.env.ORDER_SERVICE_URL)));
app.use('/api/v1/cart', createProxyMiddleware(proxyOptions(process.env.ORDER_SERVICE_URL)));
app.use('/api/v1/delivery', createProxyMiddleware(proxyOptions(process.env.ORDER_SERVICE_URL)));

// Mock Analytics Endpoint for Sprint B1
app.post('/api/analytics/events', (req, res) => {
  const { event, data } = req.body || {};
  logger.info({ event, data }, 'Analytics event received');
  res.json({ success: true, message: 'Event logged' });
});

// ─── 404 ────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ─── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Gateway started');
});

export default app;
