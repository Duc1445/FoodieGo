import pool from '../config/database.js';
import { logger } from '../context.js';
import { MockGateway } from '../infrastructure/gateways/mock.gateway.js';

export async function startMockGatewayWorker() {
  const POLLING_INTERVAL = parseInt(process.env.MOCK_GATEWAY_POLLING_INTERVAL || '1000', 10);
  const webhookSecret = process.env.WEBHOOK_SECRET || 'mock-secret';

  // Create an instance just to reuse the payload generator
  const mockGateway = new MockGateway(webhookSecret, null);

  setInterval(async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Select jobs that are PENDING and execute_after is past
      const res = await client.query(
        `SELECT * FROM mock_gateway_jobs 
         WHERE status = 'PENDING' AND execute_after <= NOW() 
         ORDER BY execute_after ASC 
         FOR UPDATE SKIP LOCKED 
         LIMIT 100`,
      );

      for (const job of res.rows) {
        let status = 'AUTHORIZED';
        if (job.scenario === 'FAIL') status = 'DECLINED';
        if (job.scenario === 'TIMEOUT' || job.scenario === 'FAST_TIMEOUT') continue; // Real timeouts never send webhook

        // In a real system, the external Gateway (Stripe) performs an HTTP POST to our webhook URL.
        const gatewayTxId = `mock_tx_${job.payment_id}`;

        const { rawBody, signature, timestamp, webhookId } = mockGateway.generateWebhookPayload(
          gatewayTxId,
          status,
          job.payment_id,
        );

        // Perform HTTP POST to our own service to simulate external Gateway
        try {
          const port = process.env.PORT || 3005;
          const webhookUrl = `http://127.0.0.1:${port}/webhook/payment`;

          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-key-id': 'default',
              'x-signature': signature,
              'x-timestamp': timestamp.toString(),
              'x-webhook-id': webhookId,
              'x-webhook-version': '1',
            },
            body: rawBody,
          });

          if (response.ok) {
            await client.query(`UPDATE mock_gateway_jobs SET status = 'COMPLETED' WHERE id = $1`, [
              job.id,
            ]);
            logger.info(
              { jobId: job.id, paymentId: job.payment_id },
              'MockGateway Webhook sent successfully',
            );

            if (job.scenario === 'DUPLICATE_WEBHOOK') {
              // Schedule a duplicate job immediately
              await client.query(
                `INSERT INTO mock_gateway_jobs (payment_id, scenario, execute_after, status) VALUES ($1, $2, NOW(), 'PENDING')`,
                [job.payment_id, 'SUCCESS'], // The second one just succeeds
              );
            }
          } else {
            logger.warn({ jobId: job.id, status: response.status }, 'MockGateway Webhook failed');
            await client.query(`UPDATE mock_gateway_jobs SET status = 'FAILED' WHERE id = $1`, [
              job.id,
            ]);
          }
        } catch (err) {
          logger.error({ jobId: job.id, err: err.message }, 'MockGateway HTTP POST error');
          // Leave as PENDING to retry
        }
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error({ err: err.message }, 'MockGatewayWorker polling error');
    } finally {
      client.release();
    }
  }, POLLING_INTERVAL);

  logger.info(`Mock Gateway Worker started (interval: ${POLLING_INTERVAL}ms)`);
}
