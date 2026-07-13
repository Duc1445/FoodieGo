-- Up Migration
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reconciliation_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS manual_review_required BOOLEAN NOT NULL DEFAULT false;

-- Create an index to quickly find pending reconciliations.
-- Must match the WHERE clause in reconciliation.worker.js:
--   status IN ('UNKNOWN', 'REFUND_PENDING') AND next_retry_at <= NOW()
CREATE INDEX IF NOT EXISTS idx_payments_reconciliation
  ON payments (next_retry_at)
  WHERE status IN ('UNKNOWN', 'REFUND_PENDING')
    AND manual_review_required = false;

-- Down Migration
-- ALTER TABLE payments
--   DROP COLUMN IF EXISTS next_retry_at,
--   DROP COLUMN IF EXISTS reconciliation_attempts,
--   DROP COLUMN IF EXISTS manual_review_required;
-- DROP INDEX IF EXISTS idx_payments_reconciliation;
