import { EventConsumer, RabbitMQAdapter } from '@foodiego/rabbit';
import pool from '../config/database.js';
import { InventoryService } from '../application/InventoryService.js';
import { logger } from '../context.js';

class OrderPendingReservationConsumer extends EventConsumer {
  constructor(inventoryService) {
    super();
    this.inventoryService = inventoryService;
  }

  getEventType() {
    return 'OrderPendingReservation';
  }

  async handle(event) {
    logger.info({ orderId: event.payload.orderId }, 'Processing OrderPendingReservation');
    await this.inventoryService.handleOrderPendingReservation(event.payload, event.traceId);
  }
}

export async function startConsumers() {
  const inventoryService = new InventoryService();

  const rabbitMQ = new RabbitMQAdapter(
    process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  );

  const consumer = new OrderPendingReservationConsumer(inventoryService);

  await rabbitMQ.registerConsumer(consumer, pool);

  logger.info('Event Consumers started successfully');
}
