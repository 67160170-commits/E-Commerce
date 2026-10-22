import type Database from "better-sqlite3";

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export function nextOrderStatuses(status: OrderStatus): OrderStatus[] {
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ["paid", "shipped", "cancelled"],
    paid: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  };
  return [status, ...transitions[status]];
}

export function changeOrderStatus(db: Database.Database, orderId: number, status: OrderStatus, tracking?: string | null) {
  if (!Number.isSafeInteger(orderId) || orderId < 1) throw new Error("รหัสคำสั่งซื้อไม่ถูกต้อง");
  if (tracking != null && (typeof tracking !== "string" || tracking.length > 100)) throw new Error("เลขพัสดุยาวเกินไป");
  db.transaction(() => {
    const order = db.prepare("SELECT status, payment_method FROM orders WHERE id = ?").get(orderId) as
      { status: OrderStatus; payment_method: string } | undefined;
    if (!order) throw new Error("ไม่พบคำสั่งซื้อ");
    if (!nextOrderStatuses(order.status).includes(status)) throw new Error("ไม่สามารถย้อนสถานะหรือยกเลิกออเดอร์ที่จัดส่งแล้ว");
    if (order.payment_method === "bank_transfer" && order.status === "pending" && status === "shipped") {
      throw new Error("กรุณายืนยันการชำระเงินก่อนจัดส่งออเดอร์โอนเงิน");
    }
    if (status === "cancelled" && order.status !== "cancelled") {
      const items = db.prepare("SELECT product_id, SUM(quantity) AS quantity FROM order_items WHERE order_id = ? GROUP BY product_id")
        .all(orderId) as { product_id: number; quantity: number }[];
      const restore = db.prepare("UPDATE products SET stock = stock + ? WHERE id = ?");
      for (const item of items) restore.run(item.quantity, item.product_id);
    }
    db.prepare("UPDATE orders SET status = ?, tracking_number = CASE WHEN ? THEN ? ELSE tracking_number END WHERE id = ?")
      .run(status, tracking !== undefined || status === "cancelled" ? 1 : 0, status === "cancelled" ? null : tracking?.trim() || null, orderId);
  }).immediate();
}

export function archiveProduct(db: Database.Database, id: number) {
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("รหัสสินค้าไม่ถูกต้อง");
  if (!db.prepare("UPDATE products SET is_active = 0 WHERE id = ?").run(id).changes) throw new Error("ไม่พบสินค้า");
}

export function categorySales(db: Database.Database) {
  return db.prepare(`SELECT c.name AS category_name,
    COALESCE(SUM(CASE WHEN o.status IN ('paid', 'shipped', 'delivered') THEN oi.quantity * oi.unit_price ELSE 0 END), 0) AS total_revenue,
    COALESCE(SUM(CASE WHEN o.status IN ('paid', 'shipped', 'delivered') THEN oi.quantity ELSE 0 END), 0) AS total_sold
    FROM categories c LEFT JOIN products p ON p.category_id = c.id
    LEFT JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id
    WHERE p.is_active = 1 OR o.status IN ('paid', 'shipped', 'delivered')
    GROUP BY c.id ORDER BY total_revenue DESC`).all() as { category_name: string; total_revenue: number; total_sold: number }[];
}

export function positiveInteger(value: number, label: string) {
  if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${label}ต้องเป็นจำนวนเต็มมากกว่า 0`);
}

export function cartIssue(product: { stock: number; is_active: number }, quantity: number): string | undefined {
  if (product.is_active !== 1) return "สินค้าปิดการขายแล้ว กรุณาลบรายการนี้";
  if (product.stock <= 0) return "สินค้าหมด กรุณาลบรายการนี้ก่อนสั่งซื้อ";
  if (quantity > product.stock) return `คงเหลือ ${product.stock} ชิ้น กรุณาปรับจำนวนก่อนสั่งซื้อ`;
}

export function createPurchase(db: Database.Database, data: {
  userId: number; shippingAddress: string; paymentMethod: "cod" | "bank_transfer";
  items: { productId: number; quantity: number }[];
}) {
  positiveInteger(data.userId, "รหัสผู้ใช้");
  if (!["cod", "bank_transfer"].includes(data.paymentMethod)) throw new Error("วิธีชำระเงินไม่ถูกต้อง");
  if (!data.shippingAddress.trim() || data.shippingAddress.length > 2000) throw new Error("กรุณาระบุที่อยู่จัดส่งให้ถูกต้อง");
  if (!data.items.length || data.items.length > 100) throw new Error("จำนวนรายการสินค้าไม่ถูกต้อง");
  const quantities = new Map<number, number>();
  for (const item of data.items) {
    positiveInteger(item.productId, "รหัสสินค้า");
    positiveInteger(item.quantity, "จำนวนสินค้า");
    const total = (quantities.get(item.productId) ?? 0) + item.quantity;
    positiveInteger(total, "จำนวนสินค้า");
    quantities.set(item.productId, total);
  }
  return db.transaction(() => {
    let total = 0;
    const items: { id: number; price: number; quantity: number }[] = [];
    for (const [id, quantity] of quantities) {
      const product = db.prepare("SELECT name, price, stock, is_active FROM products WHERE id = ?").get(id) as
        { name: string; price: number; stock: number; is_active: number } | undefined;
      if (!product?.is_active) throw new Error("มีสินค้าบางรายการไม่พร้อมจำหน่าย");
      if (quantity > product.stock) throw new Error(`สินค้า ${product.name} มีคงเหลือ ${product.stock} ชิ้น กรุณาปรับตะกร้า`);
      total += product.price * quantity;
      if (!Number.isSafeInteger(total)) throw new Error("ยอดสั่งซื้อเกินขอบเขตที่รองรับ");
      items.push({ id, quantity, price: product.price });
    }
    const order = db.prepare("INSERT INTO orders (user_id, total, shipping_address, payment_method) VALUES (?, ?, ?, ?)")
      .run(data.userId, total, data.shippingAddress.trim(), data.paymentMethod);
    const orderId = Number(order.lastInsertRowid);
    for (const item of items) {
      const changed = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?")
        .run(item.quantity, item.id, item.quantity);
      if (changed.changes !== 1) throw new Error("สต็อกเปลี่ยนแปลง กรุณาลองใหม่");
      db.prepare("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)")
        .run(orderId, item.id, item.quantity, item.price);
    }
    return orderId;
  }).immediate();
}
