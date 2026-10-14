"use server";

import { revalidatePath } from "next/cache";
import { addToCart, clearCart, removeFromCart, updateCartQuantity } from "@/lib/cart";

export async function addToCartAction(productId: number, quantity = 1) {
  try {
    await addToCart(productId, quantity);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "ไม่สามารถเพิ่มลงตะกร้าได้",
    };
  }
}

export async function updateCartQuantityAction(productId: number, quantity: number) {
  try {
    await updateCartQuantity(productId, quantity);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "ไม่สามารถแก้ไขจำนวนได้",
    };
  }
}

export async function removeFromCartAction(productId: number) {
  try {
    await removeFromCart(productId);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "ไม่สามารถลบสินค้าได้",
    };
  }
}

export async function clearCartAction() {
  await clearCart();
  revalidatePath("/", "layout");
}
