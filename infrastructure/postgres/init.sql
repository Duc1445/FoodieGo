-- FoodieGo Database Schema
-- Auto-run on first PostgreSQL container start

-- ─────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  full_name   VARCHAR(255) NOT NULL,
  phone       VARCHAR(20),
  address     TEXT,
  role        VARCHAR(20) NOT NULL DEFAULT 'customer'
                CHECK (role IN ('customer', 'admin', 'driver', 'merchant')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);

-- ─────────────────────────────────────────────
-- ADDRESSES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address     TEXT NOT NULL,
  phone       VARCHAR(20),
  is_default  BOOLEAN NOT NULL DEFAULT false,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- ─────────────────────────────────────────────
-- RESTAURANTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS restaurants (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           VARCHAR(255) NOT NULL,
  description    TEXT,
  cover_image    VARCHAR(500),
  logo           VARCHAR(500),
  rating         DECIMAL(3,2) DEFAULT 0.00,
  total_reviews  INTEGER DEFAULT 0,
  delivery_fee   DECIMAL(12,2) DEFAULT 0.00,
  minimum_order  DECIMAL(12,2) DEFAULT 0.00,
  opening_time   VARCHAR(10),
  closing_time   VARCHAR(10),
  status         VARCHAR(30) DEFAULT 'PENDING',
  latitude       DECIMAL(10,8),
  longitude      DECIMAL(11,8),
  is_active      BOOLEAN NOT NULL DEFAULT true,
  deleted_at     TIMESTAMP WITH TIME ZONE,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants(status);
CREATE INDEX IF NOT EXISTS idx_restaurants_name_trgm ON restaurants USING gin(name gin_trgm_ops);

-- ─────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100) NOT NULL UNIQUE,
  description   TEXT,
  image_url     VARCHAR(500),
  display_order INTEGER DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed some default global categories
INSERT INTO categories (id, name, display_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Món Cơm', 1),
  ('22222222-2222-2222-2222-222222222222', 'Phở/Bún', 2),
  ('33333333-3333-3333-3333-333333333333', 'Món chính', 3),
  ('44444444-4444-4444-4444-444444444444', 'Đồ ăn vặt', 4),
  ('55555555-5555-5555-5555-555555555555', 'Đồ uống', 5)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- MENU ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id    UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  price            DECIMAL(12,2) NOT NULL CHECK (price >= 0),
  image_url        VARCHAR(500),
  status           VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OUT_OF_STOCK', 'HIDDEN', 'DISCONTINUED')),
  preparation_time INTEGER DEFAULT 15,
  display_order    INTEGER DEFAULT 0,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_name_trgm ON menu_items USING gin(name gin_trgm_ops);

-- ─────────────────────────────────────────────
-- IDEMPOTENCY
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key           VARCHAR(255) PRIMARY KEY,
  request_hash  VARCHAR(255),
  status        VARCHAR(50) NOT NULL, -- IN_PROGRESS, COMPLETED, FAILED
  response      JSONB,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at    TIMESTAMP WITH TIME ZONE NOT NULL
);

-- ─────────────────────────────────────────────
-- OUTBOX PATTERN
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS outbox_events (
  event_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type      VARCHAR(100) NOT NULL,
  event_version   INTEGER NOT NULL DEFAULT 1,
  aggregate_type  VARCHAR(100) NOT NULL,
  aggregate_id    UUID NOT NULL,
  payload         JSONB NOT NULL,
  metadata        JSONB,
  status          VARCHAR(20) DEFAULT 'PENDING',
  locked_by       VARCHAR(100), -- Identity of the Dispatcher worker
  locked_at       TIMESTAMP WITH TIME ZONE,
  lease_until     TIMESTAMP WITH TIME ZONE,
  attempt         INTEGER DEFAULT 0,
  occurred_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at    TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_outbox_status_lease ON outbox_events(status, lease_until);

-- ─────────────────────────────────────────────
-- INBOX PATTERN
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inbox_events (
  event_id              UUID NOT NULL,
  consumer_name         VARCHAR(100) NOT NULL,
  status                VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  processed_at          TIMESTAMP WITH TIME ZONE,
  processing_duration   INTEGER, -- in milliseconds
  attempt               INTEGER DEFAULT 0,
  error                 TEXT,
  trace_id              VARCHAR(255),
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (event_id, consumer_name)
);

-- ─────────────────────────────────────────────
-- DEAD LETTER QUEUE (DLQ)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dead_letter_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id        UUID NOT NULL,
  event_type      VARCHAR(100) NOT NULL,
  consumer_name   VARCHAR(100),
  payload         JSONB NOT NULL,
  reason          TEXT,
  retry_count     INTEGER DEFAULT 0,
  failed_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- REPLAY HISTORY (Audit Log)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS replay_history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dlq_id          UUID NOT NULL REFERENCES dead_letter_events(id) ON DELETE CASCADE,
  replay_id       VARCHAR(255) NOT NULL,
  operator        VARCHAR(100) DEFAULT 'system',
  reason          TEXT,
  replayed_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  result          VARCHAR(50) NOT NULL DEFAULT 'PENDING'
);

-- ─────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  restaurant_id       UUID NOT NULL REFERENCES restaurants(id) ON DELETE RESTRICT,
  status              VARCHAR(50) NOT NULL DEFAULT 'CREATED',
  subtotal            DECIMAL(12,2) NOT NULL,
  delivery_fee        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tax                 DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  discount            DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total               DECIMAL(12,2) NOT NULL,
  currency            VARCHAR(3) DEFAULT 'VND',
  payment_method      VARCHAR(50),
  address_id          UUID REFERENCES addresses(id) ON DELETE SET NULL,
  idempotency_key     VARCHAR(255) UNIQUE,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  actor_id UUID,
  actor_role VARCHAR(20),
  action_type VARCHAR(50),
  ip_address VARCHAR(45),
  user_agent TEXT,
  note TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);

-- ─────────────────────────────────────────────
-- ORDER ITEMS (SNAPSHOT)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id        UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  quantity            INTEGER NOT NULL CHECK (quantity > 0),
  -- Snapshot fields (Immutable)
  item_name           VARCHAR(255) NOT NULL,
  item_price          DECIMAL(12,2) NOT NULL,
  price_version       INTEGER NOT NULL,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_outbox_status ON outbox_events(status);

-- ─────────────────────────────────────────────
-- CARTS & CART ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS carts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id     UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  currency          VARCHAR(3) DEFAULT 'VND',
  subtotal_snapshot DECIMAL(12,2) DEFAULT 0.00,
  version           INTEGER NOT NULL DEFAULT 1,
  updated_by        UUID,
  expires_at        TIMESTAMP WITH TIME ZONE,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- A user can only have one active cart
);

CREATE TABLE IF NOT EXISTS cart_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id       UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  menu_item_id  UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cart_id, menu_item_id)
);

-- ─────────────────────────────────────────────
-- DELIVERY
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS delivery (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  driver_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  status      VARCHAR(30) NOT NULL DEFAULT 'waiting'
                CHECK (status IN ('waiting','accepted','picked_up','delivering','delivered')),
  note        TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SEED DATA
-- ─────────────────────────────────────────────
-- Admin account (password: 123456)
INSERT INTO users (id, email, password, full_name, role)
VALUES (
  '00000000-0000-4000-0000-111111111111',
  'admin@foodiego.com',
  '$2a$10$leucJlIpKICtGDhom.8nDujFWf9CC4g1xfmRYLwloU9MV9/./vHG.',
  'FoodieGo Admin',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Customer account (password: 123456)
INSERT INTO users (id, email, password, full_name, role)
VALUES (
  '00000000-0000-4000-0000-222222222222',
  'customer@foodiego.com',
  '$2a$10$leucJlIpKICtGDhom.8nDujFWf9CC4g1xfmRYLwloU9MV9/./vHG.',
  'FoodieGo Customer',
  'customer'
) ON CONFLICT (email) DO NOTHING;

-- Merchant account (password: 123456)
INSERT INTO users (id, email, password, full_name, role, approval_status)
VALUES (
  '00000000-0000-4000-0000-333333333333',
  'merchant@foodiego.com',
  '$2a$10$leucJlIpKICtGDhom.8nDujFWf9CC4g1xfmRYLwloU9MV9/./vHG.',
  'FoodieGo Merchant',
  'merchant',
  'APPROVED'
) ON CONFLICT (email) DO NOTHING;

-- Driver account (password: 123456)
INSERT INTO users (id, email, password, full_name, role, approval_status, driver_license, vehicle_type, vehicle_plate)
VALUES (
  '00000000-0000-4000-0000-444444444444',
  'driver@foodiego.com',
  '$2a$10$leucJlIpKICtGDhom.8nDujFWf9CC4g1xfmRYLwloU9MV9/./vHG.',
  'FoodieGo Driver',
  'driver',
  'APPROVED',
  'DL-999999',
  'Motorcycle',
  '59X1-12345'
) ON CONFLICT (email) DO NOTHING;

-- ─────────────────────────────────────────────
-- INVENTORY SERVICE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_stock (
  stock_item_id   VARCHAR(100) PRIMARY KEY, -- SKU
  total_quantity  INTEGER NOT NULL DEFAULT 0 CHECK (total_quantity >= 0),
  reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  version         INTEGER NOT NULL DEFAULT 1,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (reserved_quantity <= total_quantity)
);

CREATE TABLE IF NOT EXISTS inventory_reservations (
  reservation_id  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'CREATED', -- CREATED, RESERVED, CONFIRMED, EXPIRED, RELEASED
  expires_at      TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inv_res_order ON inventory_reservations(order_id);
CREATE INDEX IF NOT EXISTS idx_inv_res_status_expires ON inventory_reservations(status, expires_at);

CREATE TABLE IF NOT EXISTS inventory_reservation_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id  UUID NOT NULL REFERENCES inventory_reservations(reservation_id) ON DELETE CASCADE,
  stock_item_id   VARCHAR(100) NOT NULL REFERENCES inventory_stock(stock_item_id) ON DELETE RESTRICT,
  quantity        INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_inv_res_items_res ON inventory_reservation_items(reservation_id);

-- ─────────────────────────────────────────────
-- PAYMENT SERVICE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  currency        VARCHAR(3) DEFAULT 'VND',
  status          VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- CREATED, PENDING, AUTHORIZED, CAPTURED, REFUNDED, FAILED, EXPIRED
  payment_method  VARCHAR(50) NOT NULL, -- CASH, CARD, etc.
  gateway_provider VARCHAR(50) DEFAULT 'mock', -- The actual provider: stripe, vnpay, mock
  gateway_tx_id   VARCHAR(255),
  provider_transaction_id VARCHAR(255),
  idempotency_key VARCHAR(255) UNIQUE NOT NULL,
  error_reason    TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_inbox (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id            VARCHAR(255) NOT NULL UNIQUE,
  provider            VARCHAR(50) NOT NULL,
  provider_event_id   VARCHAR(255),
  signature           TEXT,
  payload_hash        VARCHAR(255),
  payload             JSONB,
  traceparent         VARCHAR(255),
  status              VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSED, FAILED
  received_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at        TIMESTAMP WITH TIME ZONE,
  error               TEXT
);

CREATE TABLE IF NOT EXISTS mock_gateway_jobs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id      UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  scenario        VARCHAR(50) NOT NULL,
  execute_after   TIMESTAMP WITH TIME ZONE NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ─────────────────────────────────────────────
-- PROMOTIONS
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
  promotion_type      VARCHAR(20) NOT NULL DEFAULT 'platform'
                      CHECK (promotion_type IN ('platform', 'merchant')),
  restaurant_id       UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  approval_status     VARCHAR(20) NOT NULL DEFAULT 'APPROVED'
                      CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  rejection_reason    TEXT,
  priority            INTEGER DEFAULT 0,
  is_stackable        BOOLEAN DEFAULT false,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promotion_usages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promotion_id    UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
  discount_value  DECIMAL(12,2) NOT NULL,
  used_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
CREATE INDEX IF NOT EXISTS idx_promotions_restaurant_id ON promotions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_promotion_usages_promotion_id ON promotion_usages(promotion_id);

CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  actor_id UUID,
  actor_role VARCHAR(20),
  action_type VARCHAR(50),
  ip_address VARCHAR(45),
  user_agent TEXT,
  note TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='menu_items' AND column_name='status'
  ) THEN
    ALTER TABLE menu_items 
    ADD COLUMN status VARCHAR(20) DEFAULT 'AVAILABLE' 
    CHECK (status IN ('AVAILABLE', 'OUT_OF_STOCK', 'HIDDEN', 'DISCONTINUED'));

    UPDATE menu_items 
    SET status = CASE WHEN is_available THEN 'AVAILABLE' ELSE 'OUT_OF_STOCK' END;

    ALTER TABLE menu_items DROP COLUMN is_available;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='promotions' AND column_name='priority'
  ) THEN
    ALTER TABLE promotions 
    ADD COLUMN priority INTEGER DEFAULT 0,
    ADD COLUMN is_stackable BOOLEAN DEFAULT false;
  END IF;
END $$;

 D O   \ $ \ $   
 D E C L A R E 
     c o n s t r a i n t _ n a m e   t e x t ; 
 B E G I N 
     S E L E C T   c o n n a m e   I N T O   c o n s t r a i n t _ n a m e 
     F R O M   p g _ c o n s t r a i n t 
     W H E R E   c o n r e l i d   =   ' d e l i v e r y ' : : r e g c l a s s   A N D   c o n t y p e   =   ' c '   A N D   p g _ g e t _ c o n s t r a i n t d e f ( o i d )   L I K E   ' % s t a t u s % ' ; 
     
     I F   c o n s t r a i n t _ n a m e   I S   N O T   N U L L   T H E N 
         E X E C U T E   ' A L T E R   T A B L E   d e l i v e r y   D R O P   C O N S T R A I N T   '   | |   c o n s t r a i n t _ n a m e ; 
     E N D   I F ; 
     
     A L T E R   T A B L E   d e l i v e r y   A D D   C O N S T R A I N T   d e l i v e r y _ s t a t u s _ c h e c k   C H E C K   ( s t a t u s   I N   ( ' w a i t i n g ' , ' a c c e p t e d ' , ' p i c k e d _ u p ' , ' d e l i v e r i n g ' , ' d e l i v e r e d ' ) ) ; 
 E N D   \ $ \ $ ; 
  
 