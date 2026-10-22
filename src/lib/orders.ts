import "server-only";
import { getDb } from "./db";
import { createPurchase } from "./commerce";

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
  return createPurchase(getDb(), { userId, shippingAddress, paymentMethod, items });
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
