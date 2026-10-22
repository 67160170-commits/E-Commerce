import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { catalog } from "./yadom-catalog.mjs";
import { applyProductPhotos } from "./apply-product-photos.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = process.env.DATABASE_PATH ?? path.join(root, "data", "shop.db");
if (!fs.existsSync(dbPath)) throw new Error("ไม่พบฐานข้อมูล: รัน npm run db:seed สำหรับการติดตั้งใหม่");
const db = new Database(dbPath);
db.pragma("foreign_keys = ON");
db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))");
if (db.prepare("SELECT 1 FROM schema_migrations WHERE name = ?").get("my-yadom-v1")) {
  console.log("My YaDom catalog migration already applied.");
} else {
  // SQLite backup includes WAL contents; never copy an open .db file directly.
  const backup = `${dbPath}.before-yadom-${Date.now()}.bak`;
  await db.backup(backup);
  db.transaction(() => {
    db.exec(fs.readFileSync(path.join(root, "db", "reviews.sql"), "utf8"));
    // Keep original rows and IDs so previous order_items still resolve correctly.
    db.exec("UPDATE products SET is_active = 0");
    const category = db.prepare("INSERT INTO categories (name, sort_order) VALUES (?, ?) ON CONFLICT(name) DO UPDATE SET sort_order = excluded.sort_order");
    const product = db.prepare("INSERT INTO products (name, description, price, image_url, category_id, stock) VALUES (@name, @description, @price, @image_url, @category_id, @stock)");
    catalog.forEach((group, index) => {
      category.run(group.category, index + 1);
      const { id } = db.prepare("SELECT id FROM categories WHERE name = ?").get(group.category);
      for (const item of group.products) product.run({ ...item, category_id: id });
    });
    db.prepare("INSERT INTO schema_migrations (name) VALUES (?)").run("my-yadom-v1");
  })();
  console.log(`My YaDom ready. Original accounts and orders preserved. Backup: ${backup}`);
}
const photoCount = applyProductPhotos(db);
if (photoCount) console.log(`Updated ${photoCount} sample product photos.`);
db.close();

await import("./upgrade-catalog.mjs");
