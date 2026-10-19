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
