import { randomUUID } from 'crypto';

export class OutboxMessage {
  /**
   * @param {string} aggregateId
   * @param {string} aggregateType e.g., 'FoodAggregate'
   * @param {number} aggregateVersion
   * @param {string} eventType e.g., 'FoodCreatedV1'
   * @param {number} eventVersion
   * @param {object} payload
   * @param {object} headers
   * @param {string} correlationId
   * @param {string} causationId
   */
  constructor(aggregateId, aggregateType, aggregateVersion, eventType, eventVersion, payload, headers = {}, correlationId, causationId) {
    this.id = randomUUID();
    this.aggregateId = aggregateId;
    this.aggregateType = aggregateType;
    this.aggregateVersion = aggregateVersion;
    this.eventType = eventType;
    this.eventVersion = eventVersion;
    this.payload = payload;
    this.headers = headers;
    this.correlationId = correlationId;
    this.causationId = causationId;
    this.occurredAt = new Date();
    this.publishedAt = null;
    this.retryCount = 0;
    this.status = 'PENDING';
  }
}
