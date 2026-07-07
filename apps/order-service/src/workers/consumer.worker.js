import { EventConsumer, RabbitMQAdapter } from '@foodiego/events';
import { CheckoutRepository } from '../modules/checkout/repositories/checkout.repository.js';
import { OrderStatus } from '../modules/checkout/state/order.state.js';
import { logger } from '../app.js';
import pool from '../config/database.js';

class InventoryReservedConsumer extends EventConsumer {
  constructor(checkoutRepo) {
    super();
    this.checkoutRepo = checkoutRepo;
  }

  getEventType() {
    return 'InventoryReserved';
  }

  async handle(event) {
    logger.info({ orderId: event.payload.orderId }, 'Processing InventoryReserved');
    const orderId = event.payload.orderId;
    const order = await this.checkoutRepo.getOrderById(orderId);
    if (!order) {
      logger.error({ orderId }, 'Order not found for InventoryReserved');
      return;
    }

    const outboxEvent = {
      eventType: 'PaymentRequested',
      eventVersion: 1,
      payload: {
        orderId: order.id,
        userId: order.user_id,
        amount: parseFloat(order.total),
        currency: order.currency,
        paymentMethod: order.payment_method,
        traceId: event.payload?.traceId,
      },
      metadata: {
        correlation_id: event.metadata?.correlation_id || event.eventId,
        causation_id: event.eventId,
      },
    };

    await this.checkoutRepo.updateOrderStatus(orderId, OrderStatus.READY_FOR_PAYMENT, outboxEvent);
  }
}

class InventoryReservationFailedConsumer extends EventConsumer {
  constructor(checkoutRepo) {
    super();
    this.checkoutRepo = checkoutRepo;
  }

  getEventType() {
    return 'InventoryReservationFailed';
  }

  async handle(event) {
    logger.info(
      { orderId: event.payload.orderId, reason: event.payload.reason },
      'Processing InventoryReservationFailed',
    );
    await this.checkoutRepo.updateOrderStatus(event.payload.orderId, OrderStatus.CANCELLED);
  }
}

class PaymentAuthorizedConsumer extends EventConsumer {
  constructor(checkoutRepo) {
    super();
    this.checkoutRepo = checkoutRepo;
  }

  getEventType() {
    return 'PaymentAuthorized';
  }

  async handle(event) {
    const { orderId } = event.payload;
    logger.info({ orderId }, 'Processing PaymentAuthorized');
    await this.checkoutRepo.updateOrderStatus(orderId, OrderStatus.PAID);
  }
}

class PaymentFailedConsumer extends EventConsumer {
  constructor(checkoutRepo) {
    super();
    this.checkoutRepo = checkoutRepo;
  }

  getEventType() {
    return 'PaymentFailed';
  }

  async handle(event) {
    const { orderId, reason } = event.payload;
    logger.info({ orderId, reason }, 'Processing PaymentFailed');

    // Create an outbox event to notify inventory service to release stock
    const outboxEvent = {
      eventType: 'OrderCancelled',
      eventVersion: 1,
      payload: {
        orderId,
        reason,
        traceId: event.payload?.traceId,
      },
      metadata: {
        correlation_id: event.metadata?.correlation_id || event.eventId,
        causation_id: event.eventId,
      },
    };

    await this.checkoutRepo.updateOrderStatus(orderId, OrderStatus.CANCELLED, outboxEvent);
  }
}

export async function startConsumers() {
  const checkoutRepo = new CheckoutRepository();

  const rabbitMQ = new RabbitMQAdapter(
    process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  );

  const reservedConsumer = new InventoryReservedConsumer(checkoutRepo);
  const failedConsumer = new InventoryReservationFailedConsumer(checkoutRepo);
  const paymentAuthorizedConsumer = new PaymentAuthorizedConsumer(checkoutRepo);
  const paymentFailedConsumer = new PaymentFailedConsumer(checkoutRepo);

  await rabbitMQ.registerConsumer(reservedConsumer, pool);
  await rabbitMQ.registerConsumer(failedConsumer, pool);
  await rabbitMQ.registerConsumer(paymentAuthorizedConsumer, pool);
  await rabbitMQ.registerConsumer(paymentFailedConsumer, pool);

  logger.info('Event Consumers started successfully');
}
