import fs from "node:fs";
import { catalog } from "./yadom-catalog.mjs";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const db = new Database(process.env.DATABASE_PATH ?? path.join(root, "data", "shop.db"), { fileMustExist: true });
db.pragma("foreign_keys = ON");
db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now'))) ");
const alreadyApplied = db.prepare("SELECT 1 FROM schema_migrations WHERE name = ?").get("catalog-v2");
if (!alreadyApplied) {
const backup = `${db.name}.before-catalog-v2-${Date.now()}.bak`;
await db.backup(backup);
db.transaction(() => {
  const columns = db.pragma("table_info(products)").map((column) => column.name);
  for (const column of ["brand", "scent", "size", "ingredients", "usage", "source_url"]) {
    if (!columns.includes(column)) db.exec(`ALTER TABLE products ADD COLUMN ${column} TEXT NOT NULL DEFAULT ''`);
  }
  db.exec("CREATE TABLE IF NOT EXISTS auth_attempts (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, started_at INTEGER NOT NULL)");
  for (const group of catalog) {
    db.prepare("INSERT INTO categories (name, sort_order) VALUES (?, 10) ON CONFLICT(name) DO NOTHING").run(group.category);
    const { id } = db.prepare("SELECT id FROM categories WHERE name = ?").get(group.category);
    for (const product of group.products) {
      if (!db.prepare("SELECT 1 FROM products WHERE name = ?").get(product.name)) {
        db.prepare("INSERT INTO products (name, description, price, image_url, category_id, stock) VALUES (?, ?, ?, ?, ?, ?)").run(product.name, product.description, product.price, product.image_url, id, product.stock);
      }
    }
  }
  db.prepare("UPDATE products SET image_url = ? WHERE name = ? AND image_url = ?").run("/products/photos/poysian-clean.jpg", "โป๊ยเซียน มาร์คทู", "/products/photos/poysian-mark-ii.jpg");
  db.prepare("INSERT INTO schema_migrations (name) VALUES (?)").run("catalog-v2");
  // Only fill empty information. Never replace details entered by the shop administrator.
  const details = JSON.parse(fs.readFileSync(path.join(root, "db", "product-details.json"), "utf8"));
  for (const item of details) {
    for (const field of ["brand", "scent", "size", "ingredients", "usage", "source_url"]) {
      if (item[field]) db.prepare(`UPDATE products SET ${field} = ? WHERE name = ? AND ${field} = ''`).run(item[field], item.name);
    }
  }
})();
console.log(`Catalog details and authentication protection ready. Backup: ${backup}`);
} else { console.log("Catalog v2 schema already applied."); }

// Rename only the original sample display name; preserve custom account names and emails.
db.prepare("UPDATE users SET name = ? WHERE email = ? AND name = ?")
  .run("ผู้ดูแลระบบ My YaDom", "admin@vitashop.com", "ผู้ดูแลระบบ VitaShop");
db.close();
