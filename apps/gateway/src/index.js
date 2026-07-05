import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';
import { setupSwagger } from './config/swagger.js';

const app = express();
const PORT = process.env.PORT || 3000;

setupSwagger(app);

// ─── Prometheus Metrics ────────────────────────────────────────────────────
collectDefaultMetrics({ prefix: 'gateway_' });

const httpRequestCounter = new Counter({
  name: 'gateway_http_requests_total',
  help: 'Total HTTP requests through gateway',
  labelNames: ['method', 'route', 'status'],
});

const httpRequestDuration = new Histogram({
  name: 'gateway_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

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

// ─── Logging ───────────────────────────────────────────────────────────────
app.use(morgan('combined'));

// ─── Request Metrics Middleware ────────────────────────────────────────────
app.use((req, _res, next) => {
  req._startTime = Date.now();
  next();
});

app.use((req, res, next) => {
  res.on('finish', () => {
    const duration = (Date.now() - req._startTime) / 1000;
    const route = req.path.split('/')[2] || 'unknown'; // e.g. /api/users -> users
    httpRequestCounter.inc({ method: req.method, route, status: res.statusCode });
    httpRequestDuration.observe({ method: req.method, route, status: res.statusCode }, duration);
  });
  next();
});

// ─── Health & Metrics ──────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'gateway' }));

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ─── Proxy Routes ──────────────────────────────────────────────────────────
const proxyOptions = (target) => ({
  target,
  changeOrigin: true,
  on: {
    error: (err, _req, res) => {
      res.status(503).json({ success: false, message: 'Service unavailable' });
    },
  },
});

app.use('/api/auth', createProxyMiddleware(proxyOptions(process.env.IDENTITY_SERVICE_URL)));
app.use('/api/users', createProxyMiddleware(proxyOptions(process.env.IDENTITY_SERVICE_URL)));
app.use('/api/categories', createProxyMiddleware(proxyOptions(process.env.RESTAURANT_SERVICE_URL)));
app.use('/api/restaurants', createProxyMiddleware(proxyOptions(process.env.RESTAURANT_SERVICE_URL)));
app.use('/api/orders', createProxyMiddleware(proxyOptions(process.env.ORDER_SERVICE_URL)));
app.use('/api/cart', createProxyMiddleware(proxyOptions(process.env.ORDER_SERVICE_URL)));
app.use('/api/delivery', createProxyMiddleware(proxyOptions(process.env.ORDER_SERVICE_URL)));

// ─── 404 ────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ─── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Gateway] running on http://localhost:${PORT}`);
});

export default app;
