// สร้างฐานข้อมูลใหม่จาก db/schema.sql แล้วใส่ข้อมูลสินค้าตัวอย่าง
// รัน: npm run db:seed   (ลบข้อมูลเดิมทั้งหมดทุกครั้ง)
// ชื่อแบรนด์ใช้อ้างอิงจริง ราคา สต็อก และคำบรรยายกลิ่นเป็นข้อมูลตัวอย่าง

import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = process.env.DATABASE_PATH ?? path.join(root, "data", "shop.db");
const schema = fs.readFileSync(path.join(root, "db", "schema.sql"), "utf8");

import { catalog } from "./yadom-catalog.mjs";

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
for (const suffix of ["", "-wal", "-shm"]) fs.rmSync(dbPath + suffix, { force: true });

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");
db.exec(schema);
db.exec(fs.readFileSync(path.join(root, "db", "reviews.sql"), "utf8"));
db.exec("CREATE TABLE schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now'))) ");
db.prepare("INSERT INTO schema_migrations (name) VALUES (?)").run("my-yadom-v1");

const insertCategory = db.prepare("INSERT INTO categories (name, sort_order) VALUES (?, ?)");
const insertProduct = db.prepare(
  `INSERT INTO products (name, description, price, image_url, category_id, stock)
   VALUES (@name, @description, @price, @image_url, @category_id, @stock)`,
);

db.transaction(() => {
  catalog.forEach((group, index) => {
    const { lastInsertRowid } = insertCategory.run(group.category, index + 1);
    for (const product of group.products) {
      insertProduct.run({ ...product, category_id: Number(lastInsertRowid) });
    }
  });

  // สร้างบัญชีผู้ใช้ทดสอบ
  const passwordHash = bcrypt.hashSync("123456", 10);
  const insertUser = db.prepare(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
  );
  insertUser.run("ผู้ดูแลระบบ My YaDom", "admin@vitashop.com", passwordHash, "admin");
  const customerRes = insertUser.run("สมชาย ใจดี", "customer@vitashop.com", passwordHash, "customer");

  // สร้างที่อยู่จัดส่งตัวอย่างสำหรับลูกค้าทดสอบ
  const insertAddress = db.prepare(
    "INSERT INTO addresses (user_id, recipient_name, phone, address_line, is_default) VALUES (?, ?, ?, ?, ?)"
  );
  insertAddress.run(
    Number(customerRes.lastInsertRowid),
    "สมชาย ใจดี",
    "081-234-5678",
    "123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
    1
  );
})();

const summary = db
  .prepare(
    `SELECT c.name AS category, COUNT(p.id) AS products
       FROM categories c LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id ORDER BY c.sort_order`,
  )
  .all();
const total = db.prepare("SELECT COUNT(*) AS n FROM products").get().n;

console.log(`สร้างฐานข้อมูลที่ ${path.relative(root, dbPath)}`);
console.table(summary);
console.log(`สินค้าทั้งหมด ${total} รายการ`);
console.log("บัญชีทดสอบ:");
console.log("  - ผู้ดูแลระบบ: admin@vitashop.com (รหัสผ่าน: 123456)");
console.log("  - ลูกค้าทั่วไป: customer@vitashop.com (รหัสผ่าน: 123456)");
db.close();
