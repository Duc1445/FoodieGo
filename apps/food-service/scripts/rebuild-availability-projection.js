import { logger } from '../src/context.js';
import { AvailabilityProjectionConsumer } from '../src/application/events/availability-projection-consumer.js';

async function rebuild() {
  logger.info('Starting Availability Projection Rebuild');
  
  // Setup repository
  const repository = {
    findById: async (id) => null, // mock
    save: async (proj) => {}      // mock
  };

  const idempotency = {
    isProcessed: async () => false,
    markProcessed: async () => {}
  };

  const consumer = new AvailabilityProjectionConsumer(repository, idempotency);

  const mockEvents = [
    // We would stream these from event store / outbox
  ];

  for (const event of mockEvents) {
    await consumer.handle(event);
  }

  logger.info('Availability Projection Rebuild Complete');
}

rebuild();
