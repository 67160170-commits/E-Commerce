import "server-only";
import { getDb } from "./db";
import type { OrderStatus, PaymentMethod } from "./orders";

export type AdminProduct = {
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

  if (options?.lowStockOnly) {
    where.push("p.stock <= p.low_stock_threshold");
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  return db
    .prepare(
      `SELECT p.id, p.name, p.description, p.price, p.image_url, p.category_id,
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
      `SELECT p.id, p.name, p.description, p.price, p.image_url, p.category_id,
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
}): number {
  const cleanName = data.name.trim();
  if (!cleanName) throw new Error("กรุณาระบุชื่อสินค้า");
  if (data.price < 0) throw new Error("ราคาต้องไม่ต่ำกว่า 0");
  if (data.stock < 0) throw new Error("สต็อกต้องไม่ต่ำกว่า 0");
  if (data.low_stock_threshold < 0) throw new Error("เกณฑ์สต็อกต่ำต้องไม่ต่ำกว่า 0");

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

  return Number(result.lastInsertRowid);
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
    is_active: number;
  }
): void {
  const cleanName = data.name.trim();
  if (!cleanName) throw new Error("กรุณาระบุชื่อสินค้า");
  if (data.price < 0) throw new Error("ราคาต้องไม่ต่ำกว่า 0");
  if (data.stock < 0) throw new Error("สต็อกต้องไม่ต่ำกว่า 0");

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
}

export function updateAdminProductStock(id: number, stock: number): void {
  if (stock < 0) throw new Error("จำนวนสต็อกต้องไม่ต่ำกว่า 0");
  getDb()
    .prepare("UPDATE products SET stock = ? WHERE id = ?")
    .run(Math.floor(stock), id);
}

export function deleteAdminProduct(id: number): void {
  const db = getDb();
  // ตรวจสอบว่าเคยมีในออเดอร์หรือไม่
  const countRow = db
    .prepare("SELECT COUNT(*) AS c FROM order_items WHERE product_id = ?")
    .get(id) as { c: number };

  if (countRow.c > 0) {
    // หากมีออเดอร์แล้ว ให้ soft-delete เพื่อรักษาประวัติคำสั่งซื้อ
    db.prepare("UPDATE products SET is_active = 0 WHERE id = ?").run(id);
  } else {
    // หากยังไม่เคยถูกสั่งซื้อ สามารถลบถาวรได้
    db.prepare("DELETE FROM products WHERE id = ?").run(id);
  }
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

export function updateAdminOrderStatus(
  orderId: number,
  status: OrderStatus,
  trackingNumber?: string | null
): void {
  const db = getDb();
  if (trackingNumber !== undefined) {
    db.prepare("UPDATE orders SET status = ?, tracking_number = ? WHERE id = ?").run(
      status,
      trackingNumber ? trackingNumber.trim() : null,
      orderId
    );
  } else {
    db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, orderId);
  }
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
  const salesByCategory = db
    .prepare(
      `SELECT c.name AS category_name,
              COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_revenue,
              COALESCE(SUM(oi.quantity), 0) AS total_sold
         FROM categories c
         LEFT JOIN products p ON p.category_id = c.id
         LEFT JOIN order_items oi ON oi.product_id = p.id
        GROUP BY c.id
        ORDER BY total_revenue DESC`
    )
    .all() as { category_name: string; total_revenue: number; total_sold: number }[];

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

