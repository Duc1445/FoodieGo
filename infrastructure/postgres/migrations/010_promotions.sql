-- Voucher/Promotion System Migration
-- File: 010_promotions.sql

-- ─────────────────────────────────────────────
-- PROMOTIONS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promotions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code                VARCHAR(50) UNIQUE NOT NULL,
  discount_type       VARCHAR(20) NOT NULL DEFAULT 'percentage'
                      CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value      DECIMAL(12,2) NOT NULL,
  min_order_value     DECIMAL(12,2) DEFAULT 0.00,
  max_discount_value  DECIMAL(12,2),
  usage_limit         INTEGER,
  usage_count         INTEGER DEFAULT 0,
  valid_from          TIMESTAMP WITH TIME ZONE,
  valid_until         TIMESTAMP WITH TIME ZONE,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
CREATE INDEX IF NOT EXISTS idx_promotions_is_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_validity ON promotions(valid_from, valid_until);

-- ─────────────────────────────────────────────
-- PROMOTION USAGE TRACKING
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promotion_usages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promotion_id  UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  order_id      UUID REFERENCES orders(id) ON DELETE SET NULL,
  discount_value DECIMAL(12,2) NOT NULL,
  used_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotion_usages_promotion_id ON promotion_usages(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_usages_user_id ON promotion_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_promotion_usages_order_id ON promotion_usages(order_id);
