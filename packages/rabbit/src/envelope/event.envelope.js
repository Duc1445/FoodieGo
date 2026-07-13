/**
 * Standard Event Envelope for all FoodieGo events.
 * Provides a consistent structure across the entire distributed system.
 * 
 * Versioning Policy:
 * - Event schemas should ideally be backwards compatible (additive changes only).
 * - If a breaking change is absolutely unavoidable, increment `eventVersion`.
 * - Consumers MUST support processing older versions if they are still emitted,
 *   or explicitly handle version migration logic within their handlers.
 */
export class EventEnvelope {
  constructor({
    eventId,
    eventType,
    eventVersion = 1,
    occurredAt,
    traceId,          // OpenTelemetry traceId (or traceparent)
    correlationId,    // ID tying the entire Saga/Flow together
    causationId,      // ID of the event that directly caused this event
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
    this.causationId = causationId || 'unknown';
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
      causationId: this.causationId,
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      payload: this.payload,
      metadata: this.metadata,
    };
  }
}
