import crypto from 'crypto';
import { logger, metrics } from '../context.js';
import { withSpan, extractTraceContext, runWithContext } from '@foodiego/tracing';

export class WebhookController {
  constructor(repository, secretMapping) {
    this.repository = repository;
    this.secretMapping = secretMapping;
  }

  async handlePaymentWebhook(req, res) {
    const traceparentHeader = req.headers['traceparent'] || req.headers['x-trace-id'];
    let activeContext;
    if (traceparentHeader) {
      activeContext = await extractTraceContext({ traceparent: traceparentHeader });
    }

    const doWork = async () => {
      return await withSpan('Webhook', async (span) => {
        const startWebhook = process.hrtime.bigint();
        try {
          const rawBody = req.body.toString('utf8');
          const signature = req.headers['x-signature'];
          const timestampHeader = req.headers['x-timestamp'];
          const webhookId = req.headers['x-webhook-id'];

          span.setAttribute('webhook.id', webhookId || 'missing');

          if (!signature || !timestampHeader || !webhookId) {
            logger.warn('Missing required webhook headers');
            span.setStatus({ code: 2, message: 'Missing headers' });
            return res.status(403).send('Forbidden: Missing headers');
          }

          const timestamp = parseInt(timestampHeader, 10);
          if (isNaN(timestamp)) {
            span.setStatus({ code: 2, message: 'Invalid timestamp' });
            return res.status(403).send('Forbidden: Invalid timestamp');
          }

          // 1. Timestamp Verification (Zero Trust)
          const now = Math.floor(Date.now() / 1000);
          if (Math.abs(now - timestamp) > 300) {
            // 5 minutes drift allowed
            metrics.increment('payment_signature_failed_total');
            span.setStatus({ code: 2, message: 'Expired timestamp' });
            return res.status(403).send('Forbidden: Expired timestamp');
          }

          // Resolve secret using kid
          const kid = req.headers['x-key-id'] || req.headers['kid'];
          let secretToUse = this.secretMapping[kid];
          
          if (!secretToUse) {
            logger.warn({ kid }, 'Missing or unknown key ID, falling back to default secret');
            secretToUse = this.secretMapping['default'];
          }

          // 2. Signature Verification (Zero Trust)
          await withSpan('Verify Signature', async (sigSpan) => {
            const expectedSignature = crypto
              .createHmac('sha256', secretToUse)
              .update(rawBody)
              .digest('hex');

            if (signature !== expectedSignature) {
              metrics.increment('payment_signature_failed_total');
              sigSpan.setStatus({ code: 2, message: 'Invalid signature' });
              return res.status(403).send('Forbidden: Invalid signature');
            }
            sigSpan.setStatus({ code: 1, message: 'OK' });
          });

          if (res.headersSent) return; // If rejected, headers are sent

          // 3. Payload Extraction (for provider event ID mapping)
          const payload = JSON.parse(rawBody);
          const providerEventId = payload.id || webhookId; // Gateway's event ID

          const payloadHash = crypto.createHash('sha256').update(rawBody).digest('hex');

          // 4. Persist to Inbox
          return await withSpan('Inbox', async (persistSpan) => {
            const isNew = await this.repository.persistWebhookInbox(
              webhookId,
              'MOCK_GATEWAY',
              providerEventId,
              signature,
              payloadHash,
              payload,
              traceparentHeader,
            );

            if (isNew) {
              logger.info({ webhookId, providerEventId }, 'Webhook persisted to Inbox');
              persistSpan.setAttribute('is_new', true);
            } else {
              logger.info({ webhookId }, 'Duplicate webhook skipped');
              persistSpan.setAttribute('is_new', false);
            }

            // 5. Acknowledge Receipt
            span.setStatus({ code: 1, message: 'OK' });
            const endWebhook = process.hrtime.bigint();
            metrics.observe('payment_webhook_processing_duration_seconds', Number(endWebhook - startWebhook) / 1e9);
            return res.status(200).send('OK');
          });
        } catch (err) {
          logger.error({ err }, 'Webhook controller failure');
          span.recordException(err);
          span.setStatus({ code: 2, message: err.message });
          return res.status(500).send('Internal Server Error');
        }
      });
    };

    if (activeContext) {
      return await runWithContext(activeContext, doWork);
    } else {
      return await doWork();
    }
  }
}
