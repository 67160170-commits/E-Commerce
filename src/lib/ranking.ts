export const LOW_REVIEW_THRESHOLD = 3;
export function rankProducts<T extends { id: number; average_rating: number | null; review_count: number }>(products: T[]): T[] {
  return products.filter((product) => product.review_count > 0 && product.average_rating !== null)
    .sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0) || b.review_count - a.review_count || a.id - b.id);
}
