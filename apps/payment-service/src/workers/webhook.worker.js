import { logger, metrics } from '../app.js';
import { withSpan, extractTraceContext, runWithContext } from '@foodiego/tracing';

export async function startWebhookWorker(paymentService, paymentRepository) {
  const POLLING_INTERVAL = parseInt(process.env.WEBHOOK_WORKER_POLLING_INTERVAL || '1000', 10);

  setInterval(async () => {
    try {
      const pendingWebhooks = await paymentRepository.getPendingWebhooks();

      for (const webhook of pendingWebhooks) {
        let activeContext;
        if (webhook.traceparent) {
          activeContext = await extractTraceContext({ traceparent: webhook.traceparent });
        }

        const doWork = async () => {
          return await withSpan('Webhook Worker', async (span) => {
            try {
              span.setAttribute('webhook.id', webhook.event_id);
              logger.info({ eventId: webhook.event_id }, 'Processing pending webhook from Inbox');

              const payload = webhook.payload;

              if (payload.event !== 'payment.updated') {
                logger.info(
                  { eventId: webhook.event_id, eventType: payload.event },
                  'Dropping unknown webhook event',
                );
                await paymentRepository.markWebhookProcessed(webhook.event_id);
                span.setStatus({ code: 1, message: 'Dropped unknown event' });
                return;
              }

              const status = payload.data.status;

              await paymentService.processVerifiedWebhook(
                webhook.event_id,
                webhook.provider,
                payload.data.tx_id,
                status,
                payload,
                webhook.traceparent,
              );

              await paymentRepository.markWebhookProcessed(webhook.event_id);
              span.setStatus({ code: 1, message: 'Processed successfully' });
            } catch (err) {
              logger.error(
                { eventId: webhook.event_id, err: err.message },
                'Failed to process webhook from Inbox',
              );
              span.recordException(err);
              span.setStatus({ code: 2, message: err.message });
              // In real production, we might increment attempt count and set to FAILED if attempts exceed max.
            }
          });
        };

        if (activeContext) {
          await runWithContext(activeContext, doWork);
        } else {
          await doWork();
        }
      }
    } catch (err) {
      logger.error({ err: err.message }, 'WebhookWorker polling error');
    }
  }, POLLING_INTERVAL);

  logger.info(`Webhook Worker started (interval: ${POLLING_INTERVAL}ms)`);
}
