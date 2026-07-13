/**
 * @foodiego/metrics
 *
 * Centralized Prometheus Metrics Registry for FoodieGo.
 * Services do NOT create their own Histograms/Counters.
 * They call predefined factory functions from this SDK.
 *
 * Naming Convention (OpenTelemetry Semantic Conventions):
 *   http.server.duration, db.query.duration, event.publish.duration, etc.
 *
 * Label Convention (Low Cardinality Only):
 *   service, route, method, status, event_type, consumer
 *   NEVER: user_id, order_id, email, restaurant_name
 *
 * Usage:
 *   import { MetricsRegistry } from '@foodiego/metrics';
 *   const metrics = new MetricsRegistry('order-service');
 *   app.get('/metrics', async (req, res) => {
 *     res.set('Content-Type', metrics.contentType);
 *     res.end(await metrics.getMetrics());
 *   });
 */

import client from 'prom-client';

// Allowed labels per metric category (enforced at registration)
const ALLOWED_HTTP_LABELS = ['service', 'route', 'method', 'status'];
const ALLOWED_DB_LABELS = ['service', 'operation', 'collection'];
const ALLOWED_EVENT_LABELS = ['service', 'event_type', 'consumer'];
const ALLOWED_CACHE_LABELS = ['service'];

export class MetricsRegistry {
  /**
   * @param {string} serviceName - The service name (e.g., 'order-service')
   */
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.enabled = process.env.METRIC_ENABLED !== 'false';
    this.registry = new client.Registry();
    this.registry.setDefaultLabels({ service: serviceName });

    if (!this.enabled) {
      console.log(`[Metrics] Disabled via METRIC_ENABLED=false for ${serviceName}. No-op mode.`);
      return;
    }

    // Collect default Node.js metrics (GC, event loop, memory)
    client.collectDefaultMetrics({ register: this.registry, prefix: 'nodejs_' });

    this._initHttpMetrics();
    this._initDbMetrics();
    this._initEventMetrics();
    this._initCacheMetrics();
    this._initDispatcherMetrics();
    this._initPaymentMetrics();

    // Track seen invalid label keys so we only warn once per key per process lifetime
    this._seenInvalidLabels = new Set();
  }

  // ═══════════════════════════════════════════
  // Payment Business Metrics
  // ═══════════════════════════════════════════

  _initPaymentMetrics() {
    this.paymentRequestsTotal = new client.Counter({
      name: 'payment_requests_total',
      help: 'Total payment requests initiated',
      registers: [this.registry],
    });
    this.paymentSuccessTotal = new client.Counter({
      name: 'payment_success_total',
      help: 'Total successful payments',
      registers: [this.registry],
    });
    this.paymentFailedTotal = new client.Counter({
      name: 'payment_failed_total',
      help: 'Total failed payments',
      registers: [this.registry],
    });
    this.paymentWebhookDuplicateTotal = new client.Counter({
      name: 'payment_webhook_duplicate_total',
      help: 'Total duplicate webhooks received',
      registers: [this.registry],
    });
    this.paymentSignatureFailedTotal = new client.Counter({
      name: 'payment_signature_failed_total',
      help: 'Total webhook signature verification failures',
      registers: [this.registry],
    });
    this.paymentTimeoutTotal = new client.Counter({
      name: 'payment_timeout_total',
      help: 'Total gateway timeouts',
      registers: [this.registry],
    });
    this.paymentRetryTotal = new client.Counter({
      name: 'payment_retry_total',
      help: 'Total payment retry attempts',
      registers: [this.registry],
    });
    // ─── Refund Metrics ───
    this.paymentRefundRequestsTotal = new client.Counter({
      name: 'payment_refund_requests_total',
      help: 'Total payment refund requests initiated',
      registers: [this.registry],
    });
    this.paymentRefundSuccessTotal = new client.Counter({
      name: 'payment_refund_success_total',
      help: 'Total successful payment refunds',
      registers: [this.registry],
    });
    this.paymentRefundFailedTotal = new client.Counter({
      name: 'payment_refund_failed_total',
      help: 'Total failed payment refunds',
      registers: [this.registry],
    });

    // ─── Reconciliation Metrics ───
    this.paymentReconciliationTotal = new client.Counter({
      name: 'payment_reconciliation_total',
      help: 'Total reconciliation attempts per payment',
      labelNames: ['status', 'outcome'], // e.g., status=REFUND_PENDING, outcome=resolved/escalated/retried
      registers: [this.registry],
    });
    this.paymentReconciliationEscalatedTotal = new client.Counter({
      name: 'payment_reconciliation_escalated_total',
      help: 'Total manual review escalations triggered by worker',
      registers: [this.registry],
    });

    // ─── Latency Histograms ───
    // Low Cardinality Guard: NEVER use paymentId, orderId, or providerTransactionId as labels.
    this.paymentGatewayRequestDuration = new client.Histogram({
      name: 'payment_gateway_request_duration_seconds',
      help: 'Gateway HTTP call latency (from before gateway.refund() to after response). Includes serialization.',
      labelNames: ['gateway', 'operation', 'status'], // e.g., stripe, refund, success
      // Buckets: fine-grained at fast end, coarse at slow end for gateway calls (typical SLO: P99 < 2s for refund)
      buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 30],
      registers: [this.registry],
    });
    this.paymentWebhookProcessingDuration = new client.Histogram({
      name: 'payment_webhook_processing_duration_seconds',
      help: 'Total webhook handler latency (from raw body parse to 200 OK response). SLO: P99 < 500ms.',
      // Buckets: fine-grained since SLO is tight (500ms P99)
      buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
      registers: [this.registry],
    });
    this.paymentOutboxPublishDuration = new client.Histogram({
      name: 'payment_outbox_publish_duration_seconds',
      help: 'Dispatcher AMQP publish latency per event (from channel.publish() call to broker ack). SLO: P99 < 5s.',
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 5],
      registers: [this.registry],
    });
    this.paymentReconciliationDuration = new client.Histogram({
      name: 'payment_reconciliation_duration_seconds',
      help: 'Worker reconciliation batch latency (from poll start to all payments processed). SLO: P95 < 30m.',
      // Coarser buckets — this is a background batch, measured in seconds-to-minutes
      buckets: [0.1, 0.5, 1, 5, 15, 30, 60, 120, 300, 600],
      registers: [this.registry],
    });
  }

  increment(metricName, labels = {}) {
    if (!this.enabled) return;

    switch (metricName) {
      case 'payment_requests_total':
        return this.paymentRequestsTotal.inc(labels);
      case 'payment_success_total':
        return this.paymentSuccessTotal.inc(labels);
      case 'payment_failed_total':
        return this.paymentFailedTotal.inc(labels);
      case 'payment_webhook_duplicate_total':
        return this.paymentWebhookDuplicateTotal.inc(labels);
      case 'payment_signature_failed_total':
        return this.paymentSignatureFailedTotal.inc(labels);
      case 'payment_timeout_total':
        return this.paymentTimeoutTotal.inc(labels);
      case 'payment_retry_total':
        return this.paymentRetryTotal.inc(labels);
      case 'payment_refund_requests_total':
        return this.paymentRefundRequestsTotal.inc(labels);
      case 'payment_refund_success_total':
        return this.paymentRefundSuccessTotal.inc(labels);
      case 'payment_refund_failed_total':
        return this.paymentRefundFailedTotal.inc(labels);
      case 'payment_reconciliation_total':
        return this.paymentReconciliationTotal.inc(labels);
      case 'payment_reconciliation_escalated_total':
        return this.paymentReconciliationEscalatedTotal.inc(labels);
      default:
        console.warn(`[Metrics] Unknown increment: ${metricName}`);
    }
  }

  observe(metricName, value, labels = {}) {
    if (!this.enabled) return;

    // Low Cardinality Guard: drop high-cardinality labels that would cause Prometheus cardinality explosion.
    // In development: warn once per unique label key (to catch dev mistakes).
    // In production: drop silently to avoid spamming logs on hot paths.
    const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
    const dangerousLabels = ['paymentId', 'orderId', 'providerTransactionId', 'traceId', 'spanId'];
    for (const key of Object.keys(labels)) {
      if (dangerousLabels.includes(key)) {
        if (isDev && !this._seenInvalidLabels.has(key)) {
          this._seenInvalidLabels.add(key);
          console.warn(`[Metrics] High cardinality label detected and dropped: "${key}". Fix the call site — this warning fires only once per process.`);
        }
        delete labels[key];
      }
    }

    switch (metricName) {
      case 'payment_gateway_request_duration_seconds':
        return this.paymentGatewayRequestDuration.observe(labels, value);
      case 'payment_webhook_processing_duration_seconds':
        return this.paymentWebhookProcessingDuration.observe(labels, value);
      case 'payment_outbox_publish_duration_seconds':
        return this.paymentOutboxPublishDuration.observe(labels, value);
      case 'payment_reconciliation_duration_seconds':
        return this.paymentReconciliationDuration.observe(labels, value);
      default:
        if (isDev) console.warn(`[Metrics] Unknown observe: ${metricName}`);
    }
  }

  // ═══════════════════════════════════════════
  // HTTP Metrics (Gateway, Services)
  // ═══════════════════════════════════════════

  _initHttpMetrics() {
    this.httpServerDuration = new client.Histogram({
      name: 'http_server_duration_ms',
      help: 'HTTP server request duration in milliseconds',
      labelNames: ALLOWED_HTTP_LABELS,
      buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
      registers: [this.registry],
    });

    this.httpServerRequestsTotal = new client.Counter({
      name: 'http_server_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ALLOWED_HTTP_LABELS,
      registers: [this.registry],
    });
  }

  // ═══════════════════════════════════════════
  // Database Metrics
  // ═══════════════════════════════════════════

  _initDbMetrics() {
    this.dbQueryDuration = new client.Histogram({
      name: 'db_query_duration_ms',
      help: 'Database query duration in milliseconds',
      labelNames: ALLOWED_DB_LABELS,
      buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
      registers: [this.registry],
    });

    this.dbPoolActive = new client.Gauge({
      name: 'db_pool_active_connections',
      help: 'Number of active database pool connections',
      registers: [this.registry],
    });

    this.dbPoolWaiting = new client.Gauge({
      name: 'db_pool_waiting_connections',
      help: 'Number of waiting database pool connections',
      registers: [this.registry],
    });
  }

  // ═══════════════════════════════════════════
  // Event / Messaging Metrics
  // ═══════════════════════════════════════════

  _initEventMetrics() {
    this.eventPublishDuration = new client.Histogram({
      name: 'event_publish_duration_ms',
      help: 'Time to publish an event to the broker',
      labelNames: ALLOWED_EVENT_LABELS,
      buckets: [5, 10, 25, 50, 100, 250, 500],
      registers: [this.registry],
    });

    this.eventConsumeDuration = new client.Histogram({
      name: 'event_consume_duration_ms',
      help: 'Time to process a consumed event',
      labelNames: ALLOWED_EVENT_LABELS,
      buckets: [10, 50, 100, 250, 500, 1000, 5000],
      registers: [this.registry],
    });

    this.eventConsumeFailuresTotal = new client.Counter({
      name: 'event_consume_failures_total',
      help: 'Total consumer processing failures',
      labelNames: ALLOWED_EVENT_LABELS,
      registers: [this.registry],
    });

    this.eventRetryTotal = new client.Counter({
      name: 'event_retry_total',
      help: 'Total events routed to retry queues',
      labelNames: ['service', 'event_type'],
      registers: [this.registry],
    });

    this.eventDlqTotal = new client.Counter({
      name: 'event_dlq_total',
      help: 'Total events routed to DLQ',
      labelNames: ['service', 'event_type'],
      registers: [this.registry],
    });

    this.inboxDuplicateTotal = new client.Counter({
      name: 'inbox_duplicate_total',
      help: 'Duplicate events dropped by Inbox pattern',
      labelNames: ['service', 'consumer'],
      registers: [this.registry],
    });
  }

  // ═══════════════════════════════════════════
  // Cache Metrics
  // ═══════════════════════════════════════════

  _initCacheMetrics() {
    this.cacheHitTotal = new client.Counter({
      name: 'cache_hit_total',
      help: 'Total cache hits',
      labelNames: ALLOWED_CACHE_LABELS,
      registers: [this.registry],
    });

    this.cacheMissTotal = new client.Counter({
      name: 'cache_miss_total',
      help: 'Total cache misses',
      labelNames: ALLOWED_CACHE_LABELS,
      registers: [this.registry],
    });
  }

  // ═══════════════════════════════════════════
  // Dispatcher Metrics
  // ═══════════════════════════════════════════

  _initDispatcherMetrics() {
    this.dispatcherBatchDuration = new client.Histogram({
      name: 'dispatcher_batch_duration_ms',
      help: 'Duration of a full dispatcher poll-publish cycle',
      buckets: [10, 50, 100, 500, 1000, 5000],
      registers: [this.registry],
    });

    this.dispatcherBatchSize = new client.Histogram({
      name: 'dispatcher_batch_size',
      help: 'Number of events in each dispatcher batch',
      buckets: [0, 1, 5, 10, 50, 100, 500],
      registers: [this.registry],
    });

    this.dispatcherBacklog = new client.Gauge({
      name: 'dispatcher_backlog',
      help: 'Number of PENDING events in the outbox',
      registers: [this.registry],
    });
  }

  // ═══════════════════════════════════════════
  // Express Middleware (Auto-records HTTP metrics)
  // ═══════════════════════════════════════════

  /**
   * Express middleware that automatically records HTTP duration and request count.
   *
   * @example
   *   app.use(metrics.httpMiddleware());
   */
  httpMiddleware() {
    return (req, res, next) => {
      const start = process.hrtime.bigint();

      res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
        const labels = {
          route: req.route?.path || req.path || 'unknown',
          method: req.method,
          status: res.statusCode,
        };
        this.httpServerDuration.observe(labels, durationMs);
        this.httpServerRequestsTotal.inc(labels);
      });

      next();
    };
  }

  // ═══════════════════════════════════════════
  // Prometheus Endpoint Helpers
  // ═══════════════════════════════════════════

  get contentType() {
    return this.registry.contentType;
  }

  async getMetrics() {
    return this.registry.metrics();
  }
}
