import { EventConsumer, RabbitMQAdapter } from '@foodiego/events';
import { PaymentRepository } from '../infrastructure/payment.repository.js';
import { PaymentDomainService } from '../domain/payment.service.js';
import { gatewayRegistry } from '../infrastructure/gateways/gateway.registry.js';
import { MockGateway } from '../infrastructure/gateways/mock.gateway.js';
import { StripeGateway } from '../infrastructure/gateways/stripe.gateway.js';
import { VNPayGateway } from '../infrastructure/gateways/vnpay.gateway.js';
import { logger } from '../context.js';
import pool from '../config/database.js';

class PaymentRequestedConsumer extends EventConsumer {
  constructor(paymentService) {
    super();
    this.paymentService = paymentService;
  }

  getEventType() {
    return 'PaymentRequested';
  }

  async handle(event) {
    try {
      await this.paymentService.processPaymentRequest(event);
    } catch (err) {
      import('../context.js').then(({ metrics }) => {
        metrics.increment('payment_retry_total');
      });
      throw err;
    }
  }
}

class OrderCancelledConsumer extends EventConsumer {
  constructor(paymentService) {
    super();
    this.paymentService = paymentService;
  }

  getEventType() {
    return 'OrderCancelled';
  }

  async handle(event) {
    logger.info({ orderId: event.payload.orderId }, 'Processing OrderCancelled');
    const { orderId, reason, traceId } = event.payload;
    try {
      await this.paymentService.refundPayment(orderId, reason, traceId);
    } catch (err) {
      logger.error({ orderId, err: err.message }, 'Failed to refund payment for cancelled order');
      throw err; // Trigger retry
    }
  }
}

export async function startConsumers() {
  const paymentRepo = new PaymentRepository();
  
  // Re-register for standalone worker script if needed, though they run in same process
  const webhookSecret = process.env.WEBHOOK_SECRET || 'mock-secret';
  gatewayRegistry.register('mock', new MockGateway(webhookSecret, paymentRepo));
  gatewayRegistry.register('stripe', new StripeGateway('sk_test_123'));
  gatewayRegistry.register('vnpay', new VNPayGateway('VNPAY', 'vnpay-secret'));

  const paymentService = new PaymentDomainService(paymentRepo, gatewayRegistry);

  const rabbitMQ = new RabbitMQAdapter(
    process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  );

  const paymentRequestedConsumer = new PaymentRequestedConsumer(paymentService);
  const orderCancelledConsumer = new OrderCancelledConsumer(paymentService);

  await rabbitMQ.registerConsumer(paymentRequestedConsumer, pool);
  await rabbitMQ.registerConsumer(orderCancelledConsumer, pool);

  logger.info('Payment Event Consumers started successfully');
}
