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

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Platform SDKs ─────────────────────────────────────────────────────────
const logger = createLogger({ service: 'gateway' });
const metrics = new MetricsRegistry('gateway');

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
app.use(requestLogger(logger)); // Structured logging with auto traceId
app.use(metrics.httpMiddleware()); // Prometheus metrics (standardized)

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
// Admin routes - split by service
app.use(
  '/api/v1/admin/users',
  createProxyMiddleware(proxyOptions(process.env.IDENTITY_SERVICE_URL)),
);
app.use(
  '/api/v1/admin/merchants',
  createProxyMiddleware(proxyOptions(process.env.IDENTITY_SERVICE_URL)),
);
app.use(
  '/api/v1/admin/restaurants',
  createProxyMiddleware(proxyOptions(process.env.RESTAURANT_SERVICE_URL)),
);
app.use('/api/v1/admin/orders', createProxyMiddleware(proxyOptions(process.env.ORDER_SERVICE_URL)));
app.use('/api/v1/admin/stats', createProxyMiddleware(proxyOptions(process.env.ORDER_SERVICE_URL)));
app.use(
  '/api/v1/categories',
  createProxyMiddleware(proxyOptions(process.env.RESTAURANT_SERVICE_URL)),
);
app.use(
  '/api/v1/restaurants',
  createProxyMiddleware(proxyOptions(process.env.RESTAURANT_SERVICE_URL)),
);
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per windowMs
  message: {
    success: false,
    message: 'Too many search requests from this IP, please try again after a minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  '/api/v1/menus',
  searchLimiter,
  createProxyMiddleware(proxyOptions(process.env.RESTAURANT_SERVICE_URL)),
);
app.use('/api/v1/orders', createProxyMiddleware(proxyOptions(process.env.ORDER_SERVICE_URL)));
app.use('/api/v1/cart', createProxyMiddleware(proxyOptions(process.env.ORDER_SERVICE_URL)));
app.use('/api/v1/delivery', createProxyMiddleware(proxyOptions(process.env.ORDER_SERVICE_URL)));
app.use('/api/v1/promotions', createProxyMiddleware(proxyOptions(process.env.ORDER_SERVICE_URL)));
app.use('/api/v1/payments', createProxyMiddleware(proxyOptions(process.env.PAYMENT_SERVICE_URL)));
app.use('/api/v1/reviews', createProxyMiddleware(proxyOptions(process.env.RESTAURANT_SERVICE_URL)));
app.use('/api/v1/support', createProxyMiddleware(proxyOptions(process.env.ORDER_SERVICE_URL)));

// ─── Dashboard Aggregation ──────────────────────────────────────────────────
// Pulls from identity-service, restaurant-service, and order-service
// so the dashboard is not coupled to a single domain service.
app.get('/api/v1/admin/dashboard', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const headers = authHeader ? { Authorization: authHeader } : {};

  const fetchJson = async (url) => {
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  };

  const [userStatsRes, orderStatsRes] = await Promise.all([
    fetchJson(`${process.env.IDENTITY_SERVICE_URL}/api/v1/admin/stats`),
    fetchJson(`${process.env.ORDER_SERVICE_URL}/api/v1/admin/stats`),
  ]);

  const userStats = userStatsRes?.data || {};
  const orderStats = orderStatsRes?.data || {};

  res.json({
    success: true,
    data: {
      // Users (from identity-service)
      total_users: userStats.total_users ?? 0,
      total_customers: userStats.total_customers ?? 0,
      total_merchants: userStats.total_merchants ?? 0,
      total_drivers: userStats.total_drivers ?? 0,
      total_admins: userStats.total_admins ?? 0,
      pending_merchants: userStats.pending_merchants ?? 0,
      approved_merchants: userStats.approved_merchants ?? 0,
      pending_drivers: userStats.pending_drivers ?? 0,
      approved_drivers: userStats.approved_drivers ?? 0,
      rejected_applications: userStats.rejected_applications ?? 0,

      // Orders (from order-service)
      total_orders: orderStats.total_orders ?? 0,
      active_orders: orderStats.active_orders ?? 0,
      today_orders: orderStats.today_orders ?? 0,

      // Support Tickets (from order-service)
      total_tickets: orderStats.total_tickets ?? 0,
      open_tickets: orderStats.open_tickets ?? 0,
      closed_tickets: orderStats.closed_tickets ?? 0,

      // Promotions (from order-service)
      total_promotions: orderStats.total_promotions ?? 0,
      active_promotions: orderStats.active_promotions ?? 0,
    },
  });
});

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
