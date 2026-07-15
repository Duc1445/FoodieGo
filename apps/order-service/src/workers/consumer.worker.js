import { EventConsumer, RabbitMQAdapter } from '@foodiego/rabbit';
import { CheckoutRepository } from '../modules/checkout/repositories/checkout.repository.js';
import { OrderService } from '../modules/order/services/order.service.js';
import { OrderStatus } from '../modules/checkout/state/order.state.js';
import { logger } from '../config/logger.js';
import pool from '../config/database.js';

class InventoryReservedConsumer extends EventConsumer {
  constructor(checkoutRepo, orderService) {
    super();
    this.checkoutRepo = checkoutRepo;
    this.orderService = orderService;
  }

  getEventType() {
    return 'InventoryReserved';
  }

  async handle(event, trx) {
    logger.info({ orderId: event.payload.orderId }, 'Processing InventoryReserved');
    await this.orderService.processInventoryReserved(event, trx);
  }
}

class InventoryReservationFailedConsumer extends EventConsumer {
  constructor(checkoutRepo, orderService) {
    super();
    this.checkoutRepo = checkoutRepo;
    this.orderService = orderService;
  }

  getEventType() {
    return 'InventoryReservationFailed';
  }

  async handle(event, trx) {
    logger.info(
      { orderId: event.payload.orderId, reason: event.payload.reason },
      'Processing InventoryReservationFailed',
    );
    await this.orderService.processFailure(event, trx, 'InventoryFailed');
  }
}

class PaymentAuthorizedConsumer extends EventConsumer {
  constructor(checkoutRepo, orderService) {
    super();
    this.checkoutRepo = checkoutRepo;
    this.orderService = orderService;
  }

  getEventType() {
    return 'PaymentAuthorized';
  }

  async handle(event, trx) {
    const { orderId } = event.payload;
    logger.info({ orderId }, 'Processing PaymentAuthorized');
    await this.orderService.processPaymentAuthorized(event, trx);
  }
}

class PaymentFailedConsumer extends EventConsumer {
  constructor(checkoutRepo, orderService) {
    super();
    this.checkoutRepo = checkoutRepo;
    this.orderService = orderService;
  }

  getEventType() {
    return 'PaymentFailed';
  }

  async handle(event, trx) {
    const { orderId, reason } = event.payload;
    logger.info({ orderId, reason }, 'Processing PaymentFailed');
    await this.orderService.processFailure(event, trx, 'PaymentFailed');
  }
}

class RestaurantRejectedConsumer extends EventConsumer {
  constructor(checkoutRepo, orderService) {
    super();
    this.checkoutRepo = checkoutRepo;
    this.orderService = orderService;
  }

  getEventType() {
    return 'RestaurantRejected';
  }

  async handle(event, trx) {
    const { orderId, reason } = event.payload;
    logger.info({ orderId, reason }, 'Processing RestaurantRejected');
    await this.orderService.processFailure(event, trx, 'RestaurantRejected');
  }
}

class InventoryExpiredConsumer extends EventConsumer {
  constructor(checkoutRepo, orderService) {
    super();
    this.checkoutRepo = checkoutRepo;
    this.orderService = orderService;
  }

  getEventType() {
    return 'InventoryExpired';
  }

  async handle(event, trx) {
    const { orderId, reason } = event.payload;
    logger.info({ orderId, reason }, 'Processing InventoryExpired');
    await this.orderService.processFailure(event, trx, 'InventoryExpired');
  }
}

export async function startConsumers() {
  const checkoutRepo = new CheckoutRepository();
  const orderService = new OrderService();

  const rabbitMQ = new RabbitMQAdapter(
    process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  );

  const reservedConsumer = new InventoryReservedConsumer(checkoutRepo, orderService);
  const failedConsumer = new InventoryReservationFailedConsumer(checkoutRepo, orderService);
  const paymentAuthorizedConsumer = new PaymentAuthorizedConsumer(checkoutRepo, orderService);
  const paymentFailedConsumer = new PaymentFailedConsumer(checkoutRepo, orderService);
  const restaurantRejectedConsumer = new RestaurantRejectedConsumer(checkoutRepo, orderService);
  const inventoryExpiredConsumer = new InventoryExpiredConsumer(checkoutRepo, orderService);

  try {
    await rabbitMQ.registerConsumer(reservedConsumer, pool);
    await rabbitMQ.registerConsumer(failedConsumer, pool);
    await rabbitMQ.registerConsumer(paymentAuthorizedConsumer, pool);
    await rabbitMQ.registerConsumer(paymentFailedConsumer, pool);
    await rabbitMQ.registerConsumer(restaurantRejectedConsumer, pool);
    await rabbitMQ.registerConsumer(inventoryExpiredConsumer, pool);

    logger.info('Event Consumers started successfully');
  } catch (err) {
    logger.warn('Failed to start Event Consumers (RabbitMQ might be down).', err.message);
  }
}
