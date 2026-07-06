import { EventConsumer, RabbitMQAdapter } from '@foodiego/events';
import { CheckoutRepository } from '../modules/checkout/repositories/checkout.repository.js';
import { OrderStatus } from '../modules/checkout/state/order.state.js';
import { logger } from '../index.js';
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
    await this.checkoutRepo.updateOrderStatus(event.payload.orderId, OrderStatus.READY_FOR_PAYMENT);
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
    logger.info({ orderId: event.payload.orderId, reason: event.payload.reason }, 'Processing InventoryReservationFailed');
    await this.checkoutRepo.updateOrderStatus(event.payload.orderId, OrderStatus.CANCELLED);
  }
}

export async function startConsumers() {
  const checkoutRepo = new CheckoutRepository();
  
  const rabbitMQ = new RabbitMQAdapter(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672');
  
  const reservedConsumer = new InventoryReservedConsumer(checkoutRepo);
  const failedConsumer = new InventoryReservationFailedConsumer(checkoutRepo);
  
  await rabbitMQ.registerConsumer(reservedConsumer, pool);
  await rabbitMQ.registerConsumer(failedConsumer, pool);

  logger.info('Event Consumers started successfully');
}
