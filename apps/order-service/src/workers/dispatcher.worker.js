import { OutboxDispatcher, RabbitMQAdapter } from '@foodiego/events';
import pool from '../config/database.js';
import { logger } from '../index.js';

export async function startDispatcher() {
  const publisher = new RabbitMQAdapter(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672');
  const dispatcher = new OutboxDispatcher(pool, publisher, {
    workerId: 'order-service-dispatcher',
    pollIntervalIdle: 1000
  });

  await publisher.connect();
  
  process.on('SIGTERM', async () => {
    await dispatcher.stop();
  });
  
  process.on('SIGINT', async () => {
    await dispatcher.stop();
  });

  dispatcher.start().catch(err => {
    logger.error({ err }, 'Outbox Dispatcher failed');
  });
  logger.info('Outbox Dispatcher started successfully');
}
