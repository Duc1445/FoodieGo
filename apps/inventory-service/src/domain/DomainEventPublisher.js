import { EventPublisher } from '@foodiego/events';

export class DomainEventPublisher {
  constructor(client) {
    this.publisher = new EventPublisher(client);
  }

  /**
   * Publishes an event to the underlying messaging system (e.g., RabbitMQ via Outbox).
   * Note: This method is used for direct publishing if outbox is bypassed, 
   * but typically the repository will save to Outbox table instead.
   */
  async publish(eventType, aggregateType, aggregateId, payload, traceId) {
    await this.publisher.publish(eventType, {
      aggregateType,
      aggregateId,
      payload,
      traceId
    });
  }
}
