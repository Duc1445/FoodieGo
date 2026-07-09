/**
 * Standard Event Envelope for all FoodieGo events.
 * Provides a consistent structure across the entire distributed system.
 */
export class EventEnvelope {
  constructor({
    eventId,
    eventType,
    eventVersion = 1,
    occurredAt,
    traceId,
    correlationId,
    aggregateId,
    aggregateType,
    payload,
    metadata = {},
  }) {
    if (!eventId || !eventType || !aggregateType || !aggregateId || !payload) {
      throw new Error('Missing required fields in EventEnvelope');
    }

    this.eventId = eventId;
    this.eventType = eventType;
    this.eventVersion = eventVersion;
    this.occurredAt = occurredAt || new Date().toISOString();
    this.traceId = traceId || 'unknown';
    this.correlationId = correlationId || 'unknown';
    this.aggregateId = aggregateId;
    this.aggregateType = aggregateType;
    this.payload = payload;
    this.metadata = metadata;
  }

  toJSON() {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      eventVersion: this.eventVersion,
      occurredAt: this.occurredAt,
      traceId: this.traceId,
      correlationId: this.correlationId,
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      payload: this.payload,
      metadata: this.metadata,
    };
  }
}
