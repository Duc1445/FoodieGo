import crypto from 'crypto';

export class EventFactory {
  /**
   * Creates a standardized Event Envelope
   * @param {string} eventType e.g., 'OrderPendingReservation'
   * @param {string} aggregateType e.g., 'Order'
   * @param {string} aggregateId The ID of the domain entity
   * @param {object} payload The business data
   * @param {string} [correlationId] Optional, defaults to new UUID if not part of an existing saga
   * @param {string} [traceId] Optional trace ID for observability
   * @param {string} [schemaVersion] Defaults to 'v1'
   * @returns {object} The full event object
   */
  static create(eventType, aggregateType, aggregateId, payload, correlationId = null, traceId = null, schemaVersion = 'v1') {
    return {
      eventId: crypto.randomUUID(),
      eventType,
      aggregateType,
      aggregateId,
      occurredAt: new Date().toISOString(),
      correlationId: correlationId || crypto.randomUUID(),
      ...(traceId && { traceId }),
      schemaVersion,
      payload
    };
  }
}
