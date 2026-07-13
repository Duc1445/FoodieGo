import pool from '../config/database.js';
import { logger, metrics } from '../context.js';
import { PaymentStatus } from '../domain/payment.state.js';
import { PaymentAggregate } from '../domain/payment.aggregate.js';
import { withSpan } from '@foodiego/tracing';

export async function startReconciliationWorker(paymentService, paymentRepository) {
  // Poll every 1 minute; exact retry timing is controlled per-payment via next_retry_at
  const POLLING_INTERVAL = 1 * 60 * 1000;

  setInterval(async () => {
    try {
      const startBatch = process.hrtime.bigint();
      await withSpan('Reconciliation Batch', async (span) => {
        const client = await pool.connect();
        try {
          // Poll for payments stuck in UNKNOWN or REFUND_PENDING, or where a refund was requested but crashed before transition
          const res = await client.query(`
            SELECT * FROM payments 
            WHERE (
                status IN ('UNKNOWN', 'REFUND_PENDING') 
                OR (is_refund_requested = true AND status != 'REFUNDED')
              )
              AND (next_retry_at IS NULL OR next_retry_at <= NOW())
              AND manual_review_required = false
            ORDER BY next_retry_at ASC NULLS FIRST
            LIMIT 50
          `);

          const stuckPayments = res.rows;
          if (stuckPayments.length > 0) {
            logger.info({ count: stuckPayments.length }, 'Found stuck payments for reconciliation');
          }

          for (const payment of stuckPayments) {
            await withSpan('Reconcile Payment', async (pSpan) => {
              pSpan.setAttribute('paymentId', payment.id);
              const provider = payment.gateway_provider || 'mock';
              const gateway = paymentService.gatewayRegistry.resolve(provider);

            try {
              // Get the actual status from the gateway
              const gatewayState = await gateway.getPayment({ paymentId: payment.id, gatewayTxId: payment.gateway_tx_id });

              await client.query('BEGIN');
              
              const currentAttempt = payment.reconciliation_attempts + 1;
              const ageInHours = (Date.now() - new Date(payment.created_at || payment.updated_at).getTime()) / (1000 * 60 * 60);

              const aggregate = new PaymentAggregate(payment.id, {
                ...payment,
                orderId: payment.order_id,
                gatewayTxId: payment.gateway_tx_id,
              });

              let newStatus = payment.status;
              let outboxEvent = null;

              if (payment.status === PaymentStatus.UNKNOWN) {
                if (gatewayState.status === 'AUTHORIZED') {
                  aggregate.authorize(gatewayState.gatewayTxId);
                  newStatus = PaymentStatus.AUTHORIZED;
                } else if (gatewayState.status === 'FAILED') {
                  aggregate.fail('Reconciled as failed from gateway');
                  newStatus = PaymentStatus.FAILED;
                } else if (gatewayState.status === 'REFUNDED') {
                  aggregate.refund('Reconciled from gateway');
                  newStatus = PaymentStatus.REFUNDED;
                }
              } else if (payment.status === PaymentStatus.REFUND_PENDING || payment.status === PaymentStatus.AUTHORIZED) {
                if (gatewayState.status === 'REFUNDED') {
                  aggregate.refund('Reconciled from gateway');
                  newStatus = PaymentStatus.REFUNDED;
                }
              }

              if (newStatus !== payment.status) {
                outboxEvent = paymentService._buildOutboxEvent(aggregate, payment.idempotency_key, `reconcile_${payment.id}_${Date.now()}`);
                
                const updated = await paymentRepository.tryTransitionStatus(
                  client,
                  payment.id,
                  payment.status,
                  newStatus,
                  { providerTransactionId: aggregate.providerTransactionId, errorReason: aggregate.errorReason },
                  outboxEvent
                );

                if (updated) {
                  await client.query('UPDATE payments SET reconciliation_attempts = 0, next_retry_at = NULL WHERE id = $1', [payment.id]);
                  logger.info({ paymentId: payment.id, status: payment.status, newStatus, gateway: provider }, 'Successfully reconciled stuck payment');
                }
              } else {
                // Status unchanged, gateway is still PENDING or unknown
                if (currentAttempt >= 6 || ageInHours > 2) {
                  metrics.increment('payment_reconciliation_failed_total');
                  metrics.increment('payment_reconciliation_escalated_total');
                  logger.error({
                    paymentId: payment.id,
                    gatewayTxId: payment.gateway_tx_id,
                    gateway: provider,
                    status: payment.status,
                    attempt: currentAttempt,
                    ageHours: ageInHours,
                    reason: 'Max reconciliation attempts or age reached without resolving state'
                  }, 'Payment escalation required — manual review triggered');

                  await client.query(
                    'UPDATE payments SET reconciliation_attempts = $1, manual_review_required = true, next_retry_at = NULL WHERE id = $2', 
                    [currentAttempt, payment.id]
                  );
                } else {
                  const delayMinutes = Math.min(5 * Math.pow(2, currentAttempt - 1), 60);
                  const nextRetryAt = new Date(Date.now() + delayMinutes * 60 * 1000);
                  
                  await client.query(
                    'UPDATE payments SET reconciliation_attempts = $1, next_retry_at = $2 WHERE id = $3', 
                    [currentAttempt, nextRetryAt, payment.id]
                  );
                  logger.warn({ paymentId: payment.id, attempt: currentAttempt, nextRetryAt }, 'Scheduled next reconciliation retry');
                }
              }
              
              await client.query('COMMIT');
              metrics.increment('payment_reconciliation_total', { status: payment.status, outcome: newStatus !== payment.status ? 'resolved' : (currentAttempt >= 6 || ageInHours > 2 ? 'escalated' : 'retried') });
            } catch (err) {
              await client.query('ROLLBACK');
              logger.error({ paymentId: payment.id, err: err.message }, 'Failed to reconcile payment');
            }
          }); // end withSpan Reconcile Payment
          }
        } finally {
          client.release();
        }
      });
      const endBatch = process.hrtime.bigint();
      metrics.observe('payment_reconciliation_duration_seconds', Number(endBatch - startBatch) / 1e9);
    } catch (err) {
      logger.error({ err: err.message }, 'ReconciliationWorker polling error');
    }
  }, POLLING_INTERVAL); // Retry timing per-payment controlled by next_retry_at column

  logger.info(`Reconciliation Worker started (interval: ${POLLING_INTERVAL}ms)`);
}
