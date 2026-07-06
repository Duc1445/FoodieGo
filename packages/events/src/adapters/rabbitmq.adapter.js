import amqplib from 'amqplib';
import { EventPublisher } from '../publisher/event.publisher.js';
import { EventRegistry } from '../registry/event.registry.js';
import { RetryManager } from '../retry/retry.manager.js';
import { context, propagation, trace, SpanStatusCode } from '@opentelemetry/api';

export class RabbitMQAdapter extends EventPublisher {
  constructor(connectionUrl) {
    super();
    this.connectionUrl = connectionUrl || process.env.RABBITMQ_URL || 'amqp://localhost';
    this.connection = null;
    this.channel = null;
    this.exchangesSetup = new Set();
    this.retryManager = new RetryManager();
    this.isClosing = false;
  }

  async connect() {
    if (!this.connection) {
      this.connection = await amqplib.connect(this.connectionUrl);
      this.channel = await this.connection.createConfirmChannel();

      this.connection.on('error', (err) => {
        console.error('[RabbitMQ] Connection error', err);
        this.connection = null;
        process.exit(1);
      });
      this.connection.on('close', () => {
        if (!this.isClosing) {
          console.error('[RabbitMQ] Connection closed unexpectedly');
          this.connection = null;
          process.exit(1);
        }
      });
    }
  }

  async _ensureExchange(exchangeName) {
    if (!this.exchangesSetup.has(exchangeName)) {
      await this.channel.assertExchange(exchangeName, 'topic', { durable: true });
      this.exchangesSetup.add(exchangeName);
    }
  }

  async _publishContent(payload, content) {
    await this.connect();

    const evType = payload.eventType || payload.type;
    const exchangeName = EventRegistry.getTopicFor(evType);
    await this._ensureExchange(exchangeName);

    const routingKey = evType;

    return new Promise((resolve, reject) => {
      // W3C Context Propagation: inject traceparent into AMQP headers
      const headers = {};
      propagation.inject(context.active(), headers);
      if (payload.metadata && payload.metadata.correlationId) {
        headers['x-correlation-id'] = payload.metadata.correlationId;
      }

      const published = this.channel.publish(
        exchangeName,
        routingKey,
        content,
        {
          persistent: true,
          messageId: payload.eventId || payload.id,
          timestamp: new Date(payload.occurredAt).getTime(),
          type: evType,
          headers: headers,
        },
        (err) => {
          if (err) return reject(err);
          resolve(true);
        },
      );
      if (!published) {
        reject(new Error('Channel queue is full'));
      }
    });
  }

  async publish(event) {
    const content = Buffer.from(JSON.stringify(event.toJSON()));
    return this._publishContent(event, content);
  }

  async publishEnvelope(envelope) {
    const content = Buffer.from(JSON.stringify(envelope));
    return this._publishContent(envelope, content);
  }

  async publishBatch(events) {
    return Promise.all(events.map((ev) => this.publish(ev)));
  }

  async close() {
    this.isClosing = true;
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }

  /**
   * Routes a failed message to a delayed retry queue or DLQ.
   */
  async _handleFailure(msg, eventPayload, currentAttempt, errMessage, pool, consumerName) {
    const evType = eventPayload.eventType || eventPayload.type;
    const evId = eventPayload.eventId || eventPayload.id;
    const actionData = this.retryManager.getRetryAction(evType, currentAttempt);

    if (actionData.action === 'DROP') {
      console.warn(`[RabbitMQ] Dropping event ${evId} after ${currentAttempt - 1} retries.`);
      this.channel.ack(msg);
      return;
    }

    if (actionData.action === 'DLQ') {
      console.error(`[RabbitMQ] Routing event ${evId} to DLQ.`);

      const client = await pool.connect();
      try {
        await client.query(
          `
          INSERT INTO dead_letter_events (event_id, event_type, consumer_name, payload, reason, retry_count)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
          [evId, evType, consumerName, eventPayload, errMessage, currentAttempt],
        );
      } catch (dbErr) {
        console.error('[RabbitMQ] Failed to insert into dead_letter_events:', dbErr);
      } finally {
        client.release();
      }

      this.channel.ack(msg);
      return;
    }

    if (actionData.action === 'RETRY') {
      const delayMs = actionData.delayMs;
      console.log(
        `[RabbitMQ] Scheduling retry for event ${evId} in ${delayMs}ms (Attempt ${currentAttempt})`,
      );

      // Setup a delayed queue for this specific delay and event type
      const retryExchange = `foodiego.retry.${delayMs}`;
      const retryQueue = `foodiego.retry.queue.${evType}.${delayMs}`;

      await this.channel.assertExchange(retryExchange, 'topic', { durable: true });
      await this.channel.assertQueue(retryQueue, {
        durable: true,
        deadLetterExchange: msg.fields.exchange, // Route back to original exchange after TTL
        deadLetterRoutingKey: msg.fields.routingKey,
        messageTtl: delayMs,
      });
      await this.channel.bindQueue(retryQueue, retryExchange, evType);

      // Publish to the delayed queue
      this.channel.publish(retryExchange, evType, msg.content, {
        persistent: true,
        headers: { ...msg.properties.headers, 'x-retry-attempt': currentAttempt },
      });

      // ACK the original message so it doesn't block the main queue
      this.channel.ack(msg);
    }
  }

  async registerConsumer(consumer, pool) {
    await this.connect();

    const eventType = consumer.getEventType();
    const exchangeName = EventRegistry.getTopicFor(eventType);
    await this._ensureExchange(exchangeName);

    const queueName = `foodiego.queue.${consumer.constructor.name}`;
    await this.channel.assertQueue(queueName, { durable: true });
    await this.channel.bindQueue(queueName, exchangeName, eventType);

    this.channel.consume(queueName, async (msg) => {
      if (!msg) return;

      // W3C Context Propagation: extract traceparent from AMQP headers
      const parentContext = propagation.extract(context.active(), msg.properties.headers || {});
      const tracer = trace.getTracer('foodiego-consumer');
      const spanName = `${consumer.constructor.name}.Process ${eventType}`;

      // Execute consumer logic within the extracted trace context
      await context.with(parentContext, async () => {
        await tracer.startActiveSpan(spanName, async (span) => {
          await this._processMessage(msg, consumer, pool, span);
          span.end();
        });
      });
    });
  }

  /**
   * Internal: Process a consumed message within an active trace span.
   */
  async _processMessage(msg, consumer, pool, span) {
    const startTime = Date.now();
    let eventPayload;
    try {
      eventPayload = JSON.parse(msg.content.toString());
    } catch (err) {
      console.error(`[RabbitMQ] Failed to parse message, dropping:`, err);
      span.setStatus({ code: SpanStatusCode.ERROR, message: 'Parse failure' });
      return this.channel.ack(msg);
    }

    span.setAttribute('messaging.message.id', eventPayload.eventId || eventPayload.id || 'unknown');
    span.setAttribute('messaging.system', 'rabbitmq');
    span.setAttribute('messaging.operation', 'process');

    const eventId = eventPayload.eventId || eventPayload.id;
    const consumerName = consumer.constructor.name;

    let client;
    let currentAttempt = (msg.properties.headers?.['x-retry-attempt'] || 0) + 1;

    try {
      client = await pool.connect();
    } catch (err) {
      console.error(
        `[RabbitMQ] Failed to acquire DB connection in consumer ${consumerName}:`,
        err.message,
      );
      span.setStatus({ code: SpanStatusCode.ERROR, message: 'DB connection timeout' });
      // Requeue the message so it's not lost and can be retried when DB is available
      return this.channel.nack(msg, false, true);
    }

    try {
      const inboxCheck = await client.query(
        `
          INSERT INTO inbox_events (event_id, consumer_name, status, attempt)
          VALUES ($1, $2, 'PENDING', $3)
          ON CONFLICT (event_id, consumer_name) DO NOTHING
          RETURNING *;
        `,
        [eventId, consumerName, currentAttempt],
      );

      if (inboxCheck.rowCount === 0) {
        const existing = await client.query(
          'SELECT status, attempt FROM inbox_events WHERE event_id = $1 AND consumer_name = $2',
          [eventId, consumerName],
        );
        if (existing.rows[0]?.status === 'COMPLETED') {
          this.channel.ack(msg);
          return client.release();
        }
        // If it's PENDING and attempt < currentAttempt, update attempt.
        await client.query(
          `UPDATE inbox_events SET attempt = $1 WHERE event_id = $2 AND consumer_name = $3`,
          [currentAttempt, eventId, consumerName],
        );
      }

      await consumer.handle(eventPayload);

      const processingDuration = Date.now() - startTime;
      await client.query(
        `
          UPDATE inbox_events 
          SET status = 'COMPLETED', processed_at = NOW(), processing_duration = $1, error = NULL
          WHERE event_id = $2 AND consumer_name = $3
        `,
        [processingDuration, eventId, consumerName],
      );

      span.setStatus({ code: SpanStatusCode.OK });
      this.channel.ack(msg);
    } catch (err) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
      span.recordException(err);
      console.error(`[RabbitMQ] Consumer ${consumerName} failed:`, err.message);

      await client.query(
        `
          UPDATE inbox_events 
          SET error = $1
          WHERE event_id = $2 AND consumer_name = $3
        `,
        [err.message, eventId, consumerName],
      );

      // Delegate to Platform Retry Manager
      await this._handleFailure(msg, eventPayload, currentAttempt, err.message, pool, consumerName);
    } finally {
      client.release();
    }
  }
}
