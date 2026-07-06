/**
 * @foodiego/tracing
 * 
 * OpenTelemetry Node SDK with W3C Context Propagation.
 * Auto-instruments: Express, HTTP, PostgreSQL, Redis, amqplib.
 * Resource Attributes loaded from ENV (service.name, deployment.environment, etc.)
 * 
 * Usage: import this file BEFORE any other imports in your service entrypoint.
 *   import { initTracing } from '@foodiego/tracing';
 *   initTracing();
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
const ATTR_SERVICE_NAME = 'service.name';
const ATTR_SERVICE_VERSION = 'service.version';
const ATTR_DEPLOYMENT_ENVIRONMENT_NAME = 'deployment.environment';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { ParentBasedSampler, TraceIdRatioBasedSampler, AlwaysOnSampler } from '@opentelemetry/sdk-trace-node';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

/**
 * Sampling strategy per CTO guardrails:
 *   Development: 100%
 *   Staging:      20%
 *   Production:    1-5%
 *   Errors/DLQ:  Always sampled (handled at span level via AlwaysRecord)
 */
function getSampler() {
  const env = process.env.NODE_ENV || 'development';
  const ratios = {
    development: 1.0,
    staging: 0.2,
    production: parseFloat(process.env.OTEL_SAMPLING_RATIO || '0.05'),
  };
  const ratio = ratios[env] ?? 1.0;

  if (ratio >= 1.0) return new AlwaysOnSampler();
  return new ParentBasedSampler({ root: new TraceIdRatioBasedSampler(ratio) });
}

let sdk;

/**
 * Initializes OpenTelemetry tracing for the current service.
 * Must be called BEFORE importing Express or any instrumented library.
 *
 * Resource attributes are sourced from environment variables:
 *   SERVICE_NAME, SERVICE_VERSION, DEPLOYMENT_ENVIRONMENT, HOST_NAME
 */
export function initTracing() {
  // Cost Toggle: disable tracing entirely without code changes
  if (process.env.OTEL_ENABLED === 'false') {
    console.log('[Tracing] Disabled via OTEL_ENABLED=false. No-op mode.');
    return;
  }

  const serviceName = process.env.SERVICE_NAME || 'unknown-service';
  const serviceVersion = process.env.SERVICE_VERSION || '1.0.0';
  const deploymentEnv = process.env.DEPLOYMENT_ENVIRONMENT || process.env.NODE_ENV || 'development';

  if (process.env.OTEL_DEBUG === 'true') {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
  }

  const resource = new Resource({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: serviceVersion,
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: deploymentEnv,
    'service.namespace': 'foodiego',
    'host.name': process.env.HOST_NAME || process.env.HOSTNAME || 'localhost',
  });

  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317',
  });

  sdk = new NodeSDK({
    resource,
    traceExporter,
    textMapPropagator: new W3CTraceContextPropagator(),
    sampler: getSampler(),
    instrumentations: [
      getNodeAutoInstrumentations({
        // Auto-instrument: Express, HTTP, pg, ioredis, amqplib
        '@opentelemetry/instrumentation-express': { enabled: true },
        '@opentelemetry/instrumentation-http': { enabled: true },
        '@opentelemetry/instrumentation-pg': { enabled: true },
        '@opentelemetry/instrumentation-ioredis': { enabled: true },
        '@opentelemetry/instrumentation-amqplib': { enabled: true },
        // Disable noisy/unused instrumentations
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
        '@opentelemetry/instrumentation-net': { enabled: false },
      }),
    ],
  });

  sdk.start();
  console.log(`[Tracing] Initialized for "${serviceName}" (env=${deploymentEnv}, sampler=${getSampler().constructor.name})`);

  // Graceful shutdown
  const shutdown = async () => {
    try {
      await sdk.shutdown();
      console.log('[Tracing] SDK shut down successfully.');
    } catch (err) {
      console.error('[Tracing] Error during shutdown:', err);
    }
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

/**
 * Creates a manual span for business logic instrumentation.
 * Use for: Pricing Pipeline, Checkout, Dispatcher, Retry Manager.
 *
 * @param {string} spanName - e.g., "PricingPipeline.Calculate", "Checkout.Execute"
 * @param {Function} fn - async function to execute within the span
 * @returns {Promise<any>} result of fn
 *
 * @example
 *   const result = await withSpan('PricingPipeline.Calculate', async (span) => {
 *     span.setAttribute('order.item_count', items.length);
 *     return calculatePrice(items);
 *   });
 */
export async function withSpan(spanName, fn) {
  const { trace, SpanStatusCode } = await import('@opentelemetry/api');
  const tracer = trace.getTracer('foodiego-manual');
  return tracer.startActiveSpan(spanName, async (span) => {
    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (err) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
      span.recordException(err);
      throw err;
    } finally {
      span.end();
    }
  });
}

/**
 * Returns the current active trace context for propagation across boundaries.
 * Used by the Messaging Runtime to inject traceparent into AMQP headers.
 */
export function getActiveTraceHeaders() {
  const { context, propagation } = require('@opentelemetry/api');
  const carrier = {};
  propagation.inject(context.active(), carrier);
  return carrier; // { traceparent: '...', tracestate: '...' }
}

/**
 * Extracts trace context from incoming headers (HTTP or AMQP).
 * Used by Consumers to continue the parent trace.
 */
export function extractTraceContext(headers) {
  const { context, propagation } = require('@opentelemetry/api');
  return propagation.extract(context.active(), headers);
}
