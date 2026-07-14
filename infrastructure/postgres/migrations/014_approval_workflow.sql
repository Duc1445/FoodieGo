-- ─────────────────────────────────────────────
-- APPROVAL WORKFLOW MIGRATION
-- ─────────────────────────────────────────────

-- 1. Rename `merchant_status` to `approval_status`
ALTER TABLE users RENAME COLUMN merchant_status TO approval_status;

-- 2. Add new columns for Merchants & Drivers
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS business_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS business_license VARCHAR(255),
  ADD COLUMN IF NOT EXISTS tax_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS identity_card VARCHAR(50),
  ADD COLUMN IF NOT EXISTS driver_license VARCHAR(50),
  ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS vehicle_plate VARCHAR(50),
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS restaurant_images JSONB;
