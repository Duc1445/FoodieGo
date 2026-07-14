-- Migration 004: Sprint 0 (Driver FK) + Sprint 1 (Admin Merchant Approval)

-- 1. Sprint 0: Idempotent Address FK for Orders
--
-- Root-cause note: init.sql defines `address_id UUID REFERENCES addresses(id) ON DELETE SET NULL`
-- which PostgreSQL auto-names `orders_address_id_fkey`. This migration originally added a SECOND
-- FK named `fk_orders_address_id` (no ON DELETE clause) pointing to the same column.
-- Both constraints are functionally redundant. The fix: guard on EITHER name so the migration
-- never creates the duplicate on a fresh DB, and does nothing on an existing DB that already has
-- one or both constraints.
DO $$
BEGIN
    -- Only add our explicit FK if NEITHER the auto-named one NOR our named one already exists.
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name IN ('orders_address_id_fkey', 'fk_orders_address_id')
          AND table_name = 'orders'
    ) THEN
        ALTER TABLE orders ADD CONSTRAINT fk_orders_address_id
            FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Sprint 1: Idempotent Merchant Approval Columns
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'merchant_status'
    ) THEN
        ALTER TABLE users 
            ADD COLUMN merchant_status VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
            ADD CONSTRAINT chk_merchant_status CHECK (merchant_status IN ('PENDING', 'APPROVED', 'REJECTED')),
            ADD COLUMN rejection_reason TEXT,
            ADD COLUMN reviewed_by UUID REFERENCES users(id),
            ADD COLUMN reviewed_at TIMESTAMPTZ;
    END IF;
END $$;
