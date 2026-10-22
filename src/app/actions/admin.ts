"use server";

import { readProductDetails } from "@/lib/product-fields";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  createAdminProduct,
  deleteAdminProduct,
  updateAdminProduct,
  updateAdminProductStock,
  updateAdminOrderStatus,
} from "@/lib/admin";
import type { OrderStatus } from "@/lib/orders";

export type AdminActionState = {
  error?: string;
  success?: boolean;
};

export async function createProductAction(
  prevState: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();

  const name = ((formData.get("name") as string) || "").trim();
  const description = ((formData.get("description") as string) || "").trim();
  const price = Number(formData.get("price"));
  const categoryId = Number(formData.get("category_id"));
  const stock = Number(formData.get("stock"));
  const lowStockThreshold = Number(formData.get("low_stock_threshold") || "10");
  const imageUrl = ((formData.get("image_url") as string) || "").trim() || null;

  if (!name) return { error: "กรุณาระบุชื่อสินค้า" };
  if (!Number.isSafeInteger(price) || price < 0) return { error: "กรุณาระบุราคาที่ถูกต้อง" };
  if (!Number.isSafeInteger(categoryId) || categoryId <= 0) return { error: "กรุณาเลือกหมวดหมู่สินค้า" };
  if (!Number.isSafeInteger(stock) || stock < 0) return { error: "กรุณาระบุจำนวนสต็อกที่ถูกต้อง" };

  try {
    createAdminProduct({
      ...readProductDetails(formData),
      name,
      description,
      price,
      category_id: categoryId,
      stock,
      low_stock_threshold: lowStockThreshold,
      image_url: imageUrl,
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเพิ่มสินค้า",
    };
  }

  revalidatePath("/", "layout");
  redirect("/admin/inventory");
}

export async function updateProductAction(
  productId: number,
  prevState: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();

  const name = ((formData.get("name") as string) || "").trim();
  const description = ((formData.get("description") as string) || "").trim();
  const price = Number(formData.get("price"));
  const categoryId = Number(formData.get("category_id"));
  const stock = Number(formData.get("stock"));
  const lowStockThreshold = Number(formData.get("low_stock_threshold") || "10");
  const imageUrl = ((formData.get("image_url") as string) || "").trim() || null;
  const isActive = formData.get("is_active") === "1" ? 1 : 0;

  if (!name) return { error: "กรุณาระบุชื่อสินค้า" };
  if (!Number.isSafeInteger(price) || price < 0) return { error: "กรุณาระบุราคาที่ถูกต้อง" };
  if (!Number.isSafeInteger(categoryId) || categoryId <= 0) return { error: "กรุณาเลือกหมวดหมู่สินค้า" };
  if (!Number.isSafeInteger(stock) || stock < 0) return { error: "กรุณาระบุจำนวนสต็อกที่ถูกต้อง" };

  try {
    updateAdminProduct(productId, {
      ...readProductDetails(formData),
      name,
      description,
      price,
      category_id: categoryId,
      stock,
      low_stock_threshold: lowStockThreshold,
      image_url: imageUrl,
      is_active: isActive,
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปเดตสินค้า",
    };
  }

  revalidatePath("/", "layout");
  redirect("/admin/inventory");
}

export async function updateStockAction(productId: number, stock: number) {
  await requireAdmin();
  try {
    updateAdminProductStock(productId, stock);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "ไม่สามารถอัปเดตสต็อกได้",
    };
  }
}

export async function deleteProductAction(productId: number) {
  await requireAdmin();
  try {
    deleteAdminProduct(productId);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "ไม่สามารถลบสินค้าได้",
    };
  }
}

export async function updateOrderStatusAction(
  orderId: number,
  status: OrderStatus,
  trackingNumber?: string | null
) {
  await requireAdmin();
  try {
    updateAdminOrderStatus(orderId, status, trackingNumber);
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "ไม่สามารถเปลี่ยนสถานะออเดอร์ได้",
    };
  }
}
