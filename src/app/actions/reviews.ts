"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getProduct } from "@/lib/products";

export type ReviewState = { error?: string; success?: boolean };

export async function saveReviewAction(_previous: ReviewState | null, form: FormData): Promise<ReviewState> {
  const user = await getCurrentUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบก่อนให้คะแนน" };
  const productId = Number(form.get("productId"));
  const rating = Number(form.get("rating"));
  const rawComment = form.get("comment");
  const comment = typeof rawComment === "string" ? rawComment.trim() : "";
  if (!Number.isSafeInteger(productId) || productId <= 0 || !getProduct(productId)) return { error: "ไม่พบสินค้า" };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "เลือกคะแนนความหอม 1–5" };
  if (comment.length > 500) return { error: "เขียนรีวิวได้ไม่เกิน 500 ตัวอักษร" };
  try {
    getDb().prepare(`INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)
      ON CONFLICT(product_id, user_id) DO UPDATE SET rating = excluded.rating,
      comment = excluded.comment, updated_at = datetime('now')`).run(productId, user.id, rating, comment);
  } catch {
    return { error: "บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }
  revalidatePath(`/products/${productId}`);
  revalidatePath("/");
  revalidatePath("/rankings");
  return { success: true };
}
