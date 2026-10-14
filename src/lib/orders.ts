import "server-only";
import { getDb } from "./db";

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "cod" | "bank_transfer";

export type Order = {
  id: number;
  user_id: number;
  status: OrderStatus;
  total: number;
  shipping_address: string;
  payment_method: PaymentMethod;
  tracking_number: string | null;
  created_at: string;
};

export type OrderItemDetail = {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  image_url: string | null;
  category_id: number;
};

export type OrderWithItems = {
  order: Order;
  items: OrderItemDetail[];
};

export function createOrder({
  userId,
  shippingAddress,
  paymentMethod,
  items,
}: {
  userId: number;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  items: { productId: number; quantity: number }[];
}): number {
  if (items.length === 0) {
    throw new Error("ไม่มีสินค้าในรายการสั่งซื้อ");
  }

  const cleanAddress = shippingAddress.trim();
  if (!cleanAddress) {
    throw new Error("กรุณาระบุที่อยู่จัดส่ง");
  }

  const db = getDb();

  return db.transaction(() => {
    let orderTotal = 0;
    const verifiedItems: {
      productId: number;
      quantity: number;
      unitPrice: number;
    }[] = [];

    // 1. ตรวจสอบสต็อกและราคาสินค้าทุกรายการ
    for (const item of items) {
      if (item.quantity <= 0) continue;

      const product = db
        .prepare("SELECT id, name, price, stock, is_active FROM products WHERE id = ?")
        .get(item.productId) as
        | { id: number; name: string; price: number; stock: number; is_active: number }
        | undefined;

      if (!product || product.is_active !== 1) {
        throw new Error("มีสินค้าบางรายการไม่พร้อมจำหน่าย");
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `สินค้า "${product.name}" มีสต็อกคงเหลือเพียง ${product.stock} ชิ้น ไม่พอสำหรับจำนวนที่สั่งซื้อ (${item.quantity} ชิ้น)`
        );
      }

      verifiedItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
      });

      orderTotal += product.price * item.quantity;
    }

    if (verifiedItems.length === 0) {
      throw new Error("ไม่มีสินค้าในรายการสั่งซื้อ");
    }

    // 2. ตัดสต็อกสินค้า
    const updateStockStmt = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
    for (const item of verifiedItems) {
      updateStockStmt.run(item.quantity, item.productId);
    }

    // 3. บันทึกคำสั่งซื้อ
    const insertOrderStmt = db.prepare(
      `INSERT INTO orders (user_id, status, total, shipping_address, payment_method)
       VALUES (?, 'pending', ?, ?, ?)`
    );
    const orderResult = insertOrderStmt.run(userId, orderTotal, cleanAddress, paymentMethod);
    const orderId = Number(orderResult.lastInsertRowid);

    // 4. บันทึกรายการสินค้าในคำสั่งซื้อ
    const insertItemStmt = db.prepare(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
       VALUES (?, ?, ?, ?)`
    );
    for (const item of verifiedItems) {
      insertItemStmt.run(orderId, item.productId, item.quantity, item.unitPrice);
    }

    return orderId;
  })();
}

export function getUserOrders(userId: number): Order[] {
  return getDb()
    .prepare(
      "SELECT id, user_id, status, total, shipping_address, payment_method, tracking_number, created_at FROM orders WHERE user_id = ? ORDER BY id DESC"
    )
    .all(userId) as Order[];
}

export function getOrderById(orderId: number, userId?: number): OrderWithItems | null {
  const db = getDb();

  const query = userId
    ? "SELECT id, user_id, status, total, shipping_address, payment_method, tracking_number, created_at FROM orders WHERE id = ? AND user_id = ?"
    : "SELECT id, user_id, status, total, shipping_address, payment_method, tracking_number, created_at FROM orders WHERE id = ?";

  const order = (
    userId ? db.prepare(query).get(orderId, userId) : db.prepare(query).get(orderId)
  ) as Order | undefined;

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
    .all(order.id) as OrderItemDetail[];

  return { order, items };
}
