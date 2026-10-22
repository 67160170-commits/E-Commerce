import "server-only";
import { getDb } from "./db";
import type { SortKey } from "./catalog-url";
import type { ProductDetails } from "./product-fields";

export type Category = { id: number; name: string };

export type Product = ProductDetails & {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: number;
  category_name: string;
  stock: number;
  is_active: number;
  average_rating: number | null;
  review_count: number;
  low_stock_threshold: number;
};

const SORT_SQL: Record<SortKey, string> = {
  recommended: "p.id ASC",
  rating: "CASE WHEN (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) >= 3 THEN 0 ELSE 1 END, average_rating DESC, review_count DESC, p.id ASC",
  "price-asc": "p.price ASC, p.id ASC",
  "price-desc": "p.price DESC, p.id ASC",
  name: "p.name COLLATE NOCASE ASC",
};

const SELECT_PRODUCT = `
  SELECT p.id, p.name, p.description, p.price, p.image_url, p.category_id, p.brand, p.scent, p.size, p.ingredients, p.usage, p.source_url,
         c.name AS category_name, p.stock, p.is_active, p.low_stock_threshold,
         (SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id) AS average_rating,
         (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) AS review_count
    FROM products p
    JOIN categories c ON c.id = p.category_id`;

export function listCategories(includeInactive = false): Category[] {
  return getDb()
    .prepare(`SELECT id, name FROM categories ${includeInactive ? "" : "WHERE EXISTS (SELECT 1 FROM products p WHERE p.category_id = categories.id AND p.is_active = 1)"} ORDER BY sort_order, id`)
    .all() as Category[];
}

// ค้นหาแบบทุกคำต้องตรง (AND) โดยดูทั้งชื่อและคำอธิบาย
// escape อักขระพิเศษของ LIKE เพื่อให้ค้นหา % หรือ _ ได้ตรงตัว
function likePattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, "\\$&")}%`;
}

export function listProducts(options: {
  q?: string;
  brand?: string;
  categoryId?: number;
  sort?: SortKey;
}): Product[] {
  const where: string[] = ["p.is_active = 1"];
  const values: (string | number)[] = [];

  const terms = (options.q ?? "").split(/\s+/).filter(Boolean).slice(0, 5);
  for (const term of terms) {
    where.push("(p.name LIKE ? ESCAPE '\\' OR p.description LIKE ? ESCAPE '\\' OR p.brand LIKE ? ESCAPE '\\' OR p.scent LIKE ? ESCAPE '\\')");
    values.push(likePattern(term), likePattern(term), likePattern(term), likePattern(term));
  }
  if (options.brand) { where.push("p.brand = ?"); values.push(options.brand); }
  if (options.categoryId) {
    where.push("p.category_id = ?");
    values.push(options.categoryId);
  }

  const orderBy = SORT_SQL[options.sort ?? "recommended"];
  return getDb()
    .prepare(`${SELECT_PRODUCT} WHERE ${where.join(" AND ")} ORDER BY ${orderBy}`)
    .all(...values) as Product[];
}

export function getProduct(id: number, includeInactive = false): Product | undefined {
  return getDb()
    .prepare(`${SELECT_PRODUCT} WHERE p.id = ? ${includeInactive ? "" : "AND p.is_active = 1"}`)
    .get(id) as Product | undefined;
}

export function listBrands(): string[] {
  return (getDb().prepare("SELECT DISTINCT brand FROM products WHERE is_active = 1 AND brand != '' ORDER BY brand").all() as { brand: string }[]).map(row => row.brand);
}
