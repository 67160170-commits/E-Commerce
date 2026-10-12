import "server-only";
import { getDb } from "./db";
import type { SortKey } from "./catalog-url";

export type Category = { id: number; name: string };

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: number;
  category_name: string;
  stock: number;
  low_stock_threshold: number;
};

const SORT_SQL: Record<SortKey, string> = {
  recommended: "p.id ASC",
  "price-asc": "p.price ASC, p.id ASC",
  "price-desc": "p.price DESC, p.id ASC",
  name: "p.name COLLATE NOCASE ASC",
};

const SELECT_PRODUCT = `
  SELECT p.id, p.name, p.description, p.price, p.image_url, p.category_id,
         c.name AS category_name, p.stock, p.low_stock_threshold
    FROM products p
    JOIN categories c ON c.id = p.category_id`;

export function listCategories(): Category[] {
  return getDb()
    .prepare("SELECT id, name FROM categories ORDER BY sort_order, id")
    .all() as Category[];
}

// ค้นหาแบบทุกคำต้องตรง (AND) โดยดูทั้งชื่อและคำอธิบาย
// escape อักขระพิเศษของ LIKE เพื่อให้ค้นหา % หรือ _ ได้ตรงตัว
function likePattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, "\\$&")}%`;
}

export function listProducts(options: {
  q?: string;
  categoryId?: number;
  sort?: SortKey;
}): Product[] {
  const where: string[] = ["p.is_active = 1"];
  const values: (string | number)[] = [];

  const terms = (options.q ?? "").split(/\s+/).filter(Boolean).slice(0, 5);
  for (const term of terms) {
    where.push("(p.name LIKE ? ESCAPE '\\' OR p.description LIKE ? ESCAPE '\\')");
    values.push(likePattern(term), likePattern(term));
  }
  if (options.categoryId) {
    where.push("p.category_id = ?");
    values.push(options.categoryId);
  }

  const orderBy = SORT_SQL[options.sort ?? "recommended"];
  return getDb()
    .prepare(`${SELECT_PRODUCT} WHERE ${where.join(" AND ")} ORDER BY ${orderBy}`)
    .all(...values) as Product[];
}

export function getProduct(id: number): Product | undefined {
  return getDb()
    .prepare(`${SELECT_PRODUCT} WHERE p.id = ? AND p.is_active = 1`)
    .get(id) as Product | undefined;
}
