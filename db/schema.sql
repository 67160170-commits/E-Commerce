-- โครงสร้างฐานข้อมูล My YaDom (SQLite)
-- ตารางร้านค้าและการป้องกันการเข้าสู่ระบบ; ตารางรีวิวอยู่ใน reviews.sql
-- ราคาและยอดเงินเก็บเป็นจำนวนเต็ม หน่วยบาท

PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,                       -- bcrypt hash เท่านั้น ห้ามเก็บรหัสผ่านจริง
  role          TEXT    NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE addresses (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_name TEXT    NOT NULL,
  phone          TEXT    NOT NULL,
  address_line   TEXT    NOT NULL,
  is_default     INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1))
);

CREATE TABLE categories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE products (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  name                TEXT    NOT NULL,
  description         TEXT    NOT NULL DEFAULT '',
  brand TEXT NOT NULL DEFAULT '',
  scent TEXT NOT NULL DEFAULT '',
  size TEXT NOT NULL DEFAULT '',
  ingredients TEXT NOT NULL DEFAULT '',
  usage TEXT NOT NULL DEFAULT '',
  source_url TEXT NOT NULL DEFAULT '',
  price               INTEGER NOT NULL CHECK (price >= 0),
  image_url           TEXT,                               -- ว่าง = ใช้ภาพ placeholder
  category_id         INTEGER NOT NULL REFERENCES categories(id),
  stock               INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 10 CHECK (low_stock_threshold >= 0),
  is_active           INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at          TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE orders (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id          INTEGER NOT NULL REFERENCES users(id),
  status           TEXT    NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  total            INTEGER NOT NULL CHECK (total >= 0),
  shipping_address TEXT    NOT NULL,                      -- เก็บสำเนาที่อยู่ ณ วันสั่งซื้อ
  payment_method   TEXT    NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'bank_transfer')),
  tracking_number  TEXT,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE order_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0)     -- ราคา ณ วันสั่งซื้อ
);

-- บันทึกความยินยอมคุกกี้ (PDPA) — ใช้ในสัปดาห์ที่ 4
-- คุกกี้ที่จำเป็นไม่ต้องขอความยินยอมจึงไม่มีคอลัมน์
CREATE TABLE consent_logs (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id     TEXT    NOT NULL,                        -- รหัสสุ่มของผู้เยี่ยมชม
  user_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  analytics      INTEGER NOT NULL DEFAULT 0 CHECK (analytics IN (0, 1)),
  functional     INTEGER NOT NULL DEFAULT 0 CHECK (functional IN (0, 1)),
  marketing      INTEGER NOT NULL DEFAULT 0 CHECK (marketing IN (0, 1)),
  policy_version TEXT    NOT NULL,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name     ON products(name);
CREATE INDEX idx_addresses_user    ON addresses(user_id);
CREATE INDEX idx_orders_user       ON orders(user_id);
CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_consent_visitor   ON consent_logs(visitor_id);

CREATE TABLE IF NOT EXISTS auth_attempts (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, started_at INTEGER NOT NULL);
