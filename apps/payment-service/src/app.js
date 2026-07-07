// Tracing initialized in index.js
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

// Mount webhook routes BEFORE express.json() because webhooks need express.raw()
import { setupWebhookRoutes } from './routes/webhook.routes.js';
import { PaymentDomainService } from './domain/payment.service.js';
import { PaymentRepository } from './infrastructure/payment.repository.js';
import { MockGateway } from './infrastructure/gateways/mock.gateway.js';

const paymentRepo = new PaymentRepository();
const webhookSecret = process.env.WEBHOOK_SECRET || 'mock-secret';
const mockGateway = new MockGateway(webhookSecret, paymentRepo);
const paymentService = new PaymentDomainService(paymentRepo, mockGateway);

app.use('/webhook', setupWebhookRoutes(paymentRepo, webhookSecret));

// Now use express.json() for all other routes
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
import { startMockGatewayWorker } from './workers/mock.gateway.worker.js';
import { startWebhookWorker } from './workers/webhook.worker.js';

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    logger.info({ port: PORT }, 'Payment Service started');
    await startDispatcher();
    await startConsumers();
    startMockGatewayWorker();
    startWebhookWorker(paymentService, paymentRepo);
  });
}

export { logger, metrics };
export default app;
