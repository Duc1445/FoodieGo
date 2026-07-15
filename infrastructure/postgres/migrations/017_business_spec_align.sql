-- Business spec alignment: soft-delete restaurants + promotion/voucher workflow

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_restaurants_deleted_at ON restaurants(deleted_at);

ALTER TABLE promotions
  ADD COLUMN IF NOT EXISTS promotion_type VARCHAR(20) NOT NULL DEFAULT 'platform'
    CHECK (promotion_type IN ('platform', 'merchant')),
  ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'APPROVED'
    CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_promotions_restaurant_id ON promotions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_promotions_approval_status ON promotions(approval_status);
CREATE INDEX IF NOT EXISTS idx_promotions_type ON promotions(promotion_type);

-- Existing rows are platform promotions approved by admin
UPDATE promotions
SET promotion_type = 'platform',
    approval_status = 'APPROVED'
WHERE promotion_type IS NULL OR approval_status IS NULL;
