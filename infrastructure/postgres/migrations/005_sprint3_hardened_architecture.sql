-- 1. Idempotency Key Hardening
ALTER TABLE idempotency_keys ADD COLUMN IF NOT EXISTS request_hash TEXT;
CREATE INDEX IF NOT EXISTS idx_idempotency_created_at ON idempotency_keys (created_at);

-- 2. Orders Table (Commutative Saga State Flags)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS is_inventory_reserved BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_payment_authorized BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Payments Table (Business Idempotency / Double Compensation Prevention)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments (order_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_refund_order ON payments (order_id) WHERE status = 'REFUNDED';

-- 4. Outbox Events Hardening
ALTER TABLE outbox_events ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_outbox_unpublished ON outbox_events (occurred_at) WHERE published_at IS NULL;

-- 5. Inbox Events Hardening
CREATE INDEX IF NOT EXISTS idx_inbox_cleanup ON inbox_events (processed_at);
