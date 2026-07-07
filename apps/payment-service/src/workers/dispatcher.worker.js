import { OutboxDispatcher, RabbitMQAdapter } from '@foodiego/events';
import { logger } from '../app.js';
import pool from '../config/database.js';

let dispatcher;

export async function startDispatcher() {
  const rabbitMQ = new RabbitMQAdapter(
    process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  );

  dispatcher = new OutboxDispatcher(pool, rabbitMQ, {
    batchSize: 50,
    pollIntervalIdle: 2000,
    pollIntervalActive: 100,
    workerId: `payment-dispatcher-${process.pid}`,
  });

  logger.info('Starting Outbox Dispatcher for Payment Service...');
  dispatcher.start().catch((err) => {
    logger.error({ err }, 'Dispatcher failed');
  });
}

export async function stopDispatcher() {
  if (dispatcher) {
    await dispatcher.stop();
  }
}
