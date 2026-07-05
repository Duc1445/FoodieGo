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
