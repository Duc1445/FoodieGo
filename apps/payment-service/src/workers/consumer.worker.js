import { EventConsumer, RabbitMQAdapter } from '@foodiego/events';
import { PaymentRepository } from '../infrastructure/payment.repository.js';
import { PaymentDomainService } from '../domain/payment.service.js';
import { MockGateway } from '../infrastructure/gateways/mock.gateway.js';
import { logger } from '../index.js';
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
    await this.paymentService.processPaymentRequest(event);
  }
}

export async function startConsumers() {
  const paymentRepo = new PaymentRepository();
  const gateway = new MockGateway(process.env.WEBHOOK_SECRET);
  const paymentService = new PaymentDomainService(paymentRepo, gateway);

  const rabbitMQ = new RabbitMQAdapter(
    process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  );

  const paymentRequestedConsumer = new PaymentRequestedConsumer(paymentService);

  await rabbitMQ.registerConsumer(paymentRequestedConsumer, pool);

  logger.info('Payment Event Consumers started successfully');
}
