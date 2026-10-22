import "server-only";
import { cookies } from "next/headers";
import { getProduct, type Product } from "./products";
import { positiveInteger } from "./commerce";

export type CartItem = {
  productId: number;
  quantity: number;
};

export type PopulatedCartItem = {
  product: Product;
  quantity: number;
  subtotal: number;
};

export type CartSummary = {
  items: PopulatedCartItem[];
  total: number;
  itemCount: number;
};

const CART_COOKIE_NAME = "vitashop_cart";
const CART_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 วัน

export async function getCart(): Promise<CartItem[]> {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get(CART_COOKIE_NAME);
  if (!cartCookie?.value) return [];

  try {
    const parsed = JSON.parse(cartCookie.value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.productId === "number" &&
        Number.isSafeInteger(item.productId) && item.productId > 0 &&
        typeof item.quantity === "number" && Number.isSafeInteger(item.quantity) &&
        item.quantity > 0
    );
  } catch {
    return [];
  }
}

export async function saveCart(items: CartItem[]): Promise<void> {
  const cookieStore = await cookies();
  if (items.length === 0) {
    cookieStore.delete(CART_COOKIE_NAME);
    return;
  }

  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(items), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CART_MAX_AGE_SECONDS,
  });
}

export async function getPopulatedCart(): Promise<CartSummary> {
  const rawItems = await getCart();
  const populated: PopulatedCartItem[] = [];
  let total = 0;
  let itemCount = 0;

  for (const item of rawItems) {
    const product = getProduct(item.productId, true);
    if (!product) continue;

    // Show the requested amount. Stock changes are explicit, never silently clamped at checkout.
    const qty = item.quantity;
    const subtotal = product.price * qty;

    populated.push({
      product,
      quantity: qty,
      subtotal,
    });
    total += subtotal;
    itemCount += qty;
  }

  return {
    items: populated,
    total,
    itemCount,
  };
}

export async function addToCart(productId: number, quantity = 1): Promise<void> {
  positiveInteger(productId, "รหัสสินค้า");
  positiveInteger(quantity, "จำนวนสินค้า");
  const product = getProduct(productId);
  if (!product || product.stock <= 0) {
    throw new Error("สินค้าหมดหรือไม่พร้อมจำหน่าย");
  }

  const items = await getCart();
  const index = items.findIndex((i) => i.productId === productId);

  if (index >= 0) {
    const newQty = Math.min(items[index].quantity + quantity, product.stock);
    items[index].quantity = newQty;
  } else {
    const initialQty = Math.min(quantity, product.stock);
    items.push({ productId, quantity: initialQty });
  }

  await saveCart(items);
}

export async function updateCartQuantity(productId: number, quantity: number): Promise<void> {
  positiveInteger(productId, "รหัสสินค้า");
  if (!Number.isSafeInteger(quantity) || quantity < 0) throw new Error("จำนวนสินค้าไม่ถูกต้อง");
  const items = await getCart();
  if (quantity <= 0) {
    const filtered = items.filter((i) => i.productId !== productId);
    await saveCart(filtered);
    return;
  }

  const product = getProduct(productId);
  const maxStock = product ? product.stock : quantity;
  const clampedQty = Math.min(quantity, maxStock);

  const index = items.findIndex((i) => i.productId === productId);
  if (index >= 0) {
    items[index].quantity = clampedQty;
    await saveCart(items);
  }
}

export async function removeFromCart(productId: number): Promise<void> {
  const items = await getCart();
  const filtered = items.filter((i) => i.productId !== productId);
  await saveCart(filtered);
}

export async function clearCart(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COOKIE_NAME);
}
