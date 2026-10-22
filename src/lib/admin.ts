import "server-only";
import { getDb } from "./db";
import { archiveProduct, changeOrderStatus, categorySales } from "./commerce";
import type { ProductDetails } from "./product-fields";
import type { OrderStatus, PaymentMethod } from "./orders";

export type AdminProduct = ProductDetails & {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: number;
  category_name: string;
  stock: number;
  low_stock_threshold: number;
  is_active: number;
  created_at: string;
};

export type AdminOrder = {
  id: number;
  user_id: number;
  customer_name: string;
  customer_email: string;
  status: OrderStatus;
  total: number;
  shipping_address: string;
  payment_method: PaymentMethod;
  tracking_number: string | null;
  created_at: string;
  item_count: number;
};

export type AdminOrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  image_url: string | null;
  category_id: number;
};

export function listAdminProducts(options?: {
  q?: string;
  categoryId?: number;
  lowStockOnly?: boolean;
  active?: boolean;
}): AdminProduct[] {
  const db = getDb();
  const where: string[] = [];
  const values: (string | number)[] = [];

  if (options?.q) {
    const term = `%${options.q.trim().replace(/[\\%_]/g, "\\$&")}%`;
    where.push("(p.name LIKE ? ESCAPE '\\' OR p.description LIKE ? ESCAPE '\\')");
    values.push(term, term);
  }

  if (options?.categoryId) {
    where.push("p.category_id = ?");
    values.push(options.categoryId);
  }

  if (typeof options?.active === "boolean") { where.push("p.is_active = ?"); values.push(options.active ? 1 : 0); }
  if (options?.lowStockOnly) {
    where.push("p.stock <= p.low_stock_threshold");
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  return db
    .prepare(
      `SELECT p.id, p.name, p.description, p.price, p.image_url, p.category_id, p.brand, p.scent, p.size, p.ingredients, p.usage, p.source_url,
              c.name AS category_name, p.stock, p.low_stock_threshold, p.is_active, p.created_at
         FROM products p
         JOIN categories c ON c.id = p.category_id
         ${whereClause}
        ORDER BY p.id DESC`
    )
    .all(...values) as AdminProduct[];
}

export function getAdminProduct(id: number): AdminProduct | null {
  const row = getDb()
    .prepare(
      `SELECT p.id, p.name, p.description, p.price, p.image_url, p.category_id, p.brand, p.scent, p.size, p.ingredients, p.usage, p.source_url,
              c.name AS category_name, p.stock, p.low_stock_threshold, p.is_active, p.created_at
         FROM products p
         JOIN categories c ON c.id = p.category_id
        WHERE p.id = ?`
    )
    .get(id) as AdminProduct | undefined;
  return row ?? null;
}

export function createAdminProduct(data: {
  name: string;
  description: string;
  price: number;
  category_id: number;
  stock: number;
  low_stock_threshold: number;
  image_url?: string | null;
  brand?: string; scent?: string; size?: string; ingredients?: string; usage?: string; source_url?: string;
}): number {
  if (!Number.isSafeInteger(data.category_id) || data.category_id < 1) throw new Error("หมวดหมู่สินค้าไม่ถูกต้อง");
  if (!Number.isSafeInteger(data.low_stock_threshold) || data.low_stock_threshold < 0) throw new Error("เกณฑ์สต็อกไม่ถูกต้อง");
  if (data.image_url && !/^\/(?!\/)|^https?:\/\//.test(data.image_url)) throw new Error("ลิงก์รูปภาพไม่ถูกต้อง");
  validateProductInput(data);
  const cleanName = data.name.trim();
  if (!cleanName) throw new Error("กรุณาระบุชื่อสินค้า");
  if (!Number.isSafeInteger(data.price) || data.price < 0) throw new Error("ราคาต้องไม่ต่ำกว่า 0");
  if (!Number.isSafeInteger(data.stock) || data.stock < 0) throw new Error("สต็อกต้องไม่ต่ำกว่า 0");
  if (!Number.isSafeInteger(data.low_stock_threshold) || data.low_stock_threshold < 0) throw new Error("เกณฑ์สต็อกต่ำต้องไม่ต่ำกว่า 0");

  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO products (name, description, price, category_id, stock, low_stock_threshold, image_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
    )
    .run(
      cleanName,
      data.description.trim(),
      Math.floor(data.price),
      data.category_id,
      Math.floor(data.stock),
      Math.floor(data.low_stock_threshold),
      data.image_url?.trim() || null
    );

  const id = Number(result.lastInsertRowid);
  saveDetails(db, id, data);
  return id;
}

export function updateAdminProduct(
  id: number,
  data: {
    name: string;
    description: string;
    price: number;
    category_id: number;
    stock: number;
    low_stock_threshold: number;
    image_url?: string | null;
  brand?: string; scent?: string; size?: string; ingredients?: string; usage?: string; source_url?: string;
    is_active: number;
  }
): void {
  validateProductInput(data);
  const cleanName = data.name.trim();
  if (!cleanName) throw new Error("กรุณาระบุชื่อสินค้า");
  if (!Number.isSafeInteger(data.price) || data.price < 0) throw new Error("ราคาต้องไม่ต่ำกว่า 0");
  if (!Number.isSafeInteger(data.stock) || data.stock < 0) throw new Error("สต็อกต้องไม่ต่ำกว่า 0");

  const db = getDb();
  db.prepare(
    `UPDATE products
        SET name = ?, description = ?, price = ?, category_id = ?,
            stock = ?, low_stock_threshold = ?, image_url = ?, is_active = ?
      WHERE id = ?`
  ).run(
    cleanName,
    data.description.trim(),
    Math.floor(data.price),
    data.category_id,
    Math.floor(data.stock),
    Math.floor(data.low_stock_threshold),
    data.image_url?.trim() || null,
    data.is_active ? 1 : 0,
    id
  );
  saveDetails(db, id, data);
}

export function updateAdminProductStock(id: number, stock: number): void {
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("รหัสสินค้าไม่ถูกต้อง");
  if (!Number.isSafeInteger(stock) || stock < 0) throw new Error("จำนวนสต็อกต้องไม่ต่ำกว่า 0");
  const result = getDb()
    .prepare("UPDATE products SET stock = ? WHERE id = ?")
    .run(Math.floor(stock), id);
  if (!result.changes) throw new Error("ไม่พบสินค้า");
}

export function deleteAdminProduct(id: number): void {
  archiveProduct(getDb(), id);
}

export function listAdminOrders(options?: {
  status?: string;
  search?: string;
}): AdminOrder[] {
  const db = getDb();
  const where: string[] = [];
  const values: (string | number)[] = [];

  if (options?.status && options.status !== "all") {
    where.push("o.status = ?");
    values.push(options.status);
  }

  if (options?.search) {
    const term = `%${options.search.trim()}%`;
    const orderId = Number(options.search);
    if (Number.isInteger(orderId)) {
      where.push("(o.id = ? OR u.name LIKE ? OR u.email LIKE ?)");
      values.push(orderId, term, term);
    } else {
      where.push("(u.name LIKE ? OR u.email LIKE ?)");
      values.push(term, term);
    }
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  return db
    .prepare(
      `SELECT o.id, o.user_id, u.name AS customer_name, u.email AS customer_email,
              o.status, o.total, o.shipping_address, o.payment_method, o.tracking_number, o.created_at,
              (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count
         FROM orders o
         JOIN users u ON u.id = o.user_id
         ${whereClause}
        ORDER BY o.id DESC`
    )
    .all(...values) as AdminOrder[];
}

export function getAdminOrder(id: number): {
  order: AdminOrder;
  items: AdminOrderItem[];
} | null {
  const db = getDb();
  const order = db
    .prepare(
      `SELECT o.id, o.user_id, u.name AS customer_name, u.email AS customer_email,
              o.status, o.total, o.shipping_address, o.payment_method, o.tracking_number, o.created_at,
              (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count
         FROM orders o
         JOIN users u ON u.id = o.user_id
        WHERE o.id = ?`
    )
    .get(id) as AdminOrder | undefined;

  if (!order) return null;

  const items = db
    .prepare(
      `SELECT oi.id, oi.order_id, oi.product_id, p.name AS product_name,
              oi.quantity, oi.unit_price, p.image_url, p.category_id
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ?
        ORDER BY oi.id ASC`
    )
    .all(order.id) as AdminOrderItem[];

  return { order, items };
}

export function updateAdminOrderStatus(orderId: number, status: OrderStatus, trackingNumber?: string | null): void {
  changeOrderStatus(getDb(), orderId, status, trackingNumber);
}

export function getAdminStats() {
  const db = getDb();
  const totalProducts = (
    db.prepare("SELECT COUNT(*) AS c FROM products WHERE is_active = 1").get() as { c: number }
  ).c;

  const lowStockCount = (
    db
      .prepare(
        "SELECT COUNT(*) AS c FROM products WHERE is_active = 1 AND stock <= low_stock_threshold"
      )
      .get() as { c: number }
  ).c;

  const totalOrders = (
    db.prepare("SELECT COUNT(*) AS c FROM orders").get() as { c: number }
  ).c;

  const pendingOrders = (
    db.prepare("SELECT COUNT(*) AS c FROM orders WHERE status = 'pending'").get() as { c: number }
  ).c;

  return {
    totalProducts,
    lowStockCount,
    totalOrders,
    pendingOrders,
  };
}

export type ConsentLog = {
  id: number;
  visitor_id: string;
  user_id: number | null;
  customer_name?: string | null;
  analytics: number;
  functional: number;
  marketing: number;
  policy_version: string;
  created_at: string;
};

export function logConsent(data: {
  visitorId: string;
  userId?: number | null;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
  policyVersion: string;
}): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO consent_logs (visitor_id, user_id, analytics, functional, marketing, policy_version)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    data.visitorId,
    data.userId ?? null,
    data.analytics ? 1 : 0,
    data.functional ? 1 : 0,
    data.marketing ? 1 : 0,
    data.policyVersion
  );
}

export function listConsentLogs(limit = 20): ConsentLog[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT cl.id, cl.visitor_id, cl.user_id, u.name AS customer_name,
              cl.analytics, cl.functional, cl.marketing, cl.policy_version, cl.created_at
         FROM consent_logs cl
         LEFT JOIN users u ON u.id = cl.user_id
        ORDER BY cl.id DESC
        LIMIT ?`
    )
    .all(limit) as ConsentLog[];
}

export function getAdminDashboardData() {
  const db = getDb();

  // ยอดขายสุทธิที่ชำระหรือกำลังจัดส่งแล้ว
  const revenueRow = db
    .prepare(
      `SELECT COALESCE(SUM(total), 0) AS revenue
         FROM orders
        WHERE status IN ('paid', 'shipped', 'delivered')`
    )
    .get() as { revenue: number };

  const pendingRevenueRow = db
    .prepare(
      `SELECT COALESCE(SUM(total), 0) AS pending_revenue
         FROM orders
        WHERE status = 'pending'`
    )
    .get() as { pending_revenue: number };

  const totalOrders = (
    db.prepare("SELECT COUNT(*) AS c FROM orders").get() as { c: number }
  ).c;

  const ordersByStatus = {
    pending: (
      db.prepare("SELECT COUNT(*) AS c FROM orders WHERE status = 'pending'").get() as { c: number }
    ).c,
    paid: (
      db.prepare("SELECT COUNT(*) AS c FROM orders WHERE status = 'paid'").get() as { c: number }
    ).c,
    shipped: (
      db.prepare("SELECT COUNT(*) AS c FROM orders WHERE status = 'shipped'").get() as { c: number }
    ).c,
    delivered: (
      db.prepare("SELECT COUNT(*) AS c FROM orders WHERE status = 'delivered'").get() as { c: number }
    ).c,
    cancelled: (
      db.prepare("SELECT COUNT(*) AS c FROM orders WHERE status = 'cancelled'").get() as { c: number }
    ).c,
  };

  const totalProducts = (
    db.prepare("SELECT COUNT(*) AS c FROM products WHERE is_active = 1").get() as { c: number }
  ).c;

  // สินค้าที่สต็อกต่ำกว่าเกณฑ์
  const lowStockProducts = db
    .prepare(
      `SELECT p.id, p.name, p.price, p.stock, p.low_stock_threshold, c.name AS category_name
         FROM products p
         JOIN categories c ON c.id = p.category_id
        WHERE p.is_active = 1 AND p.stock <= p.low_stock_threshold
        ORDER BY p.stock ASC`
    )
    .all() as {
      id: number;
      name: string;
      price: number;
      stock: number;
      low_stock_threshold: number;
      category_name: string;
    }[];

  // คำสั่งซื้อล่าสุด 6 รายการ
  const recentOrders = db
    .prepare(
      `SELECT o.id, o.user_id, u.name AS customer_name, o.status, o.total, o.created_at
         FROM orders o
         JOIN users u ON u.id = o.user_id
        ORDER BY o.id DESC
        LIMIT 6`
    )
    .all() as {
      id: number;
      user_id: number;
      customer_name: string;
      status: OrderStatus;
      total: number;
      created_at: string;
    }[];

  // ยอดขายแยกตามหมวดหมู่สินค้า
  const salesByCategory = categorySales(db);

  const consentCount = (
    db.prepare("SELECT COUNT(*) AS c FROM consent_logs").get() as { c: number }
  ).c;

  return {
    totalRevenue: revenueRow.revenue,
    pendingRevenue: pendingRevenueRow.pending_revenue,
    totalOrders,
    ordersByStatus,
    totalProducts,
    lowStockProducts,
    recentOrders,
    salesByCategory,
    consentCount,
  };
}


function saveDetails(db: ReturnType<typeof getDb>, id: number, data: Partial<ProductDetails>) {
  for (const field of ["brand", "scent", "size", "ingredients", "usage", "source_url"] as const) {
    if (data[field] !== undefined) db.prepare(`UPDATE products SET ${field} = ? WHERE id = ?`).run(data[field]?.trim() || "", id);
  }
}

function validateProductInput(data: { category_id: number; low_stock_threshold: number; image_url?: string | null; source_url?: string }) {
  if (!Number.isSafeInteger(data.category_id) || data.category_id < 1 || !Number.isSafeInteger(data.low_stock_threshold) || data.low_stock_threshold < 0) throw new Error("หมวดหมู่หรือเกณฑ์สต็อกไม่ถูกต้อง");
  for (const [key, value] of [["image", data.image_url], ["source", data.source_url]]) {
    if (!value) continue;
    if (value.includes(String.fromCharCode(92)) || [...value].some(character => character.charCodeAt(0) < 32)) throw new Error("ลิงก์ไม่ถูกต้อง");
    if (key === "image" && value.startsWith("/") && !value.startsWith("//")) continue;
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol)) throw new Error("ลิงก์ต้องใช้ http หรือ https");
  }
}
