import { randomUUID } from 'crypto';
import { OutboxMessage } from '../infrastructure/outbox/outbox-message.js';

export class IntegrationEventMapper {
  /**
   * Maps Domain Events to Versioned Integration Events
   * @param {object} domainEvent 
   * @param {string} aggregateId 
   * @param {string} aggregateType 
   * @param {string} correlationId 
   */
  static mapToOutbox(domainEvent, aggregateId, aggregateType, correlationId = null) {
    const causationId = randomUUID();
    const currentCorrelationId = correlationId || randomUUID();
    const eventId = randomUUID();
    
    const headers = {
      eventId,
    };

    switch (domainEvent.type) {
      case 'FoodPublished':
        return new OutboxMessage(
          aggregateId,
          aggregateType,
          domainEvent.aggregateVersion,
          'FoodPublishedV1',
          1,
          domainEvent.payload,
          headers,
          currentCorrelationId,
          causationId
        );
      case 'VariantAdded':
        return new OutboxMessage(
          aggregateId,
          aggregateType,
          domainEvent.aggregateVersion,
          'VariantAddedV1',
          1,
          domainEvent.payload,
          headers,
          currentCorrelationId,
          causationId
        );
      default:
        return new OutboxMessage(
          aggregateId,
          aggregateType,
          domainEvent.aggregateVersion || 1,
          `${domainEvent.type}V1`,
          1,
          domainEvent.payload,
          headers,
          currentCorrelationId,
          causationId
        );
    }
  }
}
