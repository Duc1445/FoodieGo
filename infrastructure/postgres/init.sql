-- FoodieGo Database Schema
-- Auto-run on first PostgreSQL container start

-- ─────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
                CHECK (role IN ('customer', 'admin', 'shipper')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);

-- ─────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url   VARCHAR(500),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- FOODS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS foods (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(255) NOT NULL,
  description  TEXT,
  price        DECIMAL(12,2) NOT NULL CHECK (price >= 0),
  image_url    VARCHAR(500),
  category_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category_id);
CREATE INDEX IF NOT EXISTS idx_foods_name     ON foods USING gin(to_tsvector('simple', name));

-- ─────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       VARCHAR(30) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','confirmed','preparing','delivering','completed','cancelled')),
  total_price  DECIMAL(12,2) NOT NULL CHECK (total_price >= 0),
  note         TEXT,
  address      TEXT NOT NULL,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders(status);

-- ─────────────────────────────────────────────
-- ORDER ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id  UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  food_id   UUID NOT NULL REFERENCES foods(id) ON DELETE RESTRICT,
  quantity  INTEGER NOT NULL CHECK (quantity > 0),
  price     DECIMAL(12,2) NOT NULL CHECK (price >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ─────────────────────────────────────────────
-- CART ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_id   UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  quantity  INTEGER NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (user_id, food_id)
);

-- ─────────────────────────────────────────────
-- DELIVERY
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS delivery (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  shipper_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  status      VARCHAR(30) NOT NULL DEFAULT 'waiting'
                CHECK (status IN ('waiting','accepted','delivering','delivered')),
  note        TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SEED DATA
-- ─────────────────────────────────────────────
-- Admin account (password: Admin@123)
INSERT INTO users (email, password, full_name, role)
VALUES (
  'admin@foodiego.com',
  '$2b$10$rBV2JDeWW3.vKBBnpkVkpOUwG0Q2K6mOGpT0Gk5dRfBN/8kQR1.9a',
  'FoodieGo Admin',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Categories
INSERT INTO categories (name, description) VALUES
  ('Cơm', 'Các món cơm'),
  ('Bún - Phở', 'Bún phở các loại'),
  ('Bánh mì', 'Bánh mì sandwich'),
  ('Đồ uống', 'Nước giải khát'),
  ('Tráng miệng', 'Bánh ngọt, chè')
ON CONFLICT (name) DO NOTHING;
