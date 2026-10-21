import "server-only";
import { getDb } from "./db";

export type Review = { id: number; name: string; rating: number; comment: string; updated_at: string };

export function listReviews(productId: number): Review[] {
  return getDb().prepare(`SELECT r.id, u.name, r.rating, r.comment, r.updated_at
    FROM reviews r JOIN users u ON u.id = r.user_id
    WHERE r.product_id = ? ORDER BY r.updated_at DESC, r.id DESC LIMIT 50`).all(productId) as Review[];
}

export function getMyReview(productId: number, userId: number) {
  return getDb().prepare("SELECT rating, comment FROM reviews WHERE product_id = ? AND user_id = ?")
    .get(productId, userId) as { rating: number; comment: string } | undefined;
}
