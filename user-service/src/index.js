import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';
import authRoutes from './modules/auth/routes/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Prometheus ────────────────────────────────────────────────────────────
collectDefaultMetrics({ prefix: 'user_service_' });

export const httpRequestCounter = new Counter({
  name: 'user_service_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

export const httpRequestDuration = new Histogram({
  name: 'user_service_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// ─── Metrics Middleware ────────────────────────────────────────────────────
app.use((req, _res, next) => { req._startTime = Date.now(); next(); });
app.use((req, res, next) => {
  res.on('finish', () => {
    const duration = (Date.now() - req._startTime) / 1000;
    httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
    httpRequestDuration.observe({ method: req.method, route: req.path, status: res.statusCode }, duration);
  });
  next();
});

// ─── Routes ────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'user-service' }));
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/api/auth', authRoutes);
import employeeRoutes from './routes/employee.routes.js';
app.use('/api/employees', employeeRoutes);

// ─── Error Handler ─────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ success: false, message: err.message });
});

// ─── Start ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`[User Service] running on port ${PORT}`));
}

export default app;
