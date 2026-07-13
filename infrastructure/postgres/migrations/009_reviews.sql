-- Review & Rating System Migration
-- File: 009_reviews.sql

-- ─────────────────────────────────────────────
-- REVIEWS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  order_id      UUID UNIQUE REFERENCES orders(id) ON DELETE SET NULL,
  rating        INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment       TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- ─────────────────────────────────────────────
-- REVIEW IMAGES TABLE (Optional)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS review_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id   UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  image_url   VARCHAR(500) NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_images_review_id ON review_images(review_id);

-- ─────────────────────────────────────────────
-- TRIGGER: Update restaurant rating on review insert/update/delete
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.is_active = true AND NEW.is_active = false) THEN
    -- Add new review or deactivate review
    UPDATE restaurants
    SET rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE restaurant_id = NEW.restaurant_id AND is_active = true
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE restaurant_id = NEW.restaurant_id AND is_active = true
    )
    WHERE id = NEW.restaurant_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.rating <> NEW.rating THEN
    -- Rating changed
    UPDATE restaurants
    SET rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE restaurant_id = NEW.restaurant_id AND is_active = true
    )
    WHERE id = NEW.restaurant_id;
  ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.is_active = true AND NEW.is_active = false) THEN
    -- Review deleted or deactivated
    UPDATE restaurants
    SET rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id) AND is_active = true
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id) AND is_active = true
    )
    WHERE id = COALESCE(NEW.restaurant_id, OLD.restaurant_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_restaurant_rating ON reviews;
CREATE TRIGGER trigger_update_restaurant_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_restaurant_rating();
