// Tracing initialized in index.js
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { logger as l } from '@foodiego/platform-sdk';
import { logger, metrics } from './context.js';

const app = express();
const PORT = process.env.PORT || 3005;

// ─── Platform SDKs ─────────────────────────────────────────────────────────
const requestLogger = l.requestLogger;

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());

// Mount webhook routes BEFORE express.json() because webhooks need express.raw()
import { setupWebhookRoutes } from './routes/webhook.routes.js';
import { PaymentDomainService } from './domain/payment.service.js';
import { PaymentRepository } from './infrastructure/payment.repository.js';
import { gatewayRegistry } from './infrastructure/gateways/gateway.registry.js';
import { MockGateway } from './infrastructure/gateways/mock.gateway.js';
import { StripeGateway } from './infrastructure/gateways/stripe.gateway.js';
import { VNPayGateway } from './infrastructure/gateways/vnpay.gateway.js';

const paymentRepo = new PaymentRepository();
const secretMapping = {
  v1: process.env.WEBHOOK_SECRET_V1 || 'mock-secret',
  default: process.env.WEBHOOK_SECRET || 'mock-secret'
};

// Register Gateways
gatewayRegistry.register('mock', new MockGateway(secretMapping.default, paymentRepo));
gatewayRegistry.register('stripe', new StripeGateway(process.env.STRIPE_SECRET_KEY || 'sk_test_123'));
gatewayRegistry.register('vnpay', new VNPayGateway(process.env.VNPAY_TMN_CODE || 'VNPAY', process.env.VNPAY_SECRET || 'vnpay-secret'));

const paymentService = new PaymentDomainService(paymentRepo, gatewayRegistry);

app.use('/webhook', setupWebhookRoutes(paymentRepo, secretMapping));

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

// Ensure workers don't create circular dependency
export { logger, metrics };
export default app;
