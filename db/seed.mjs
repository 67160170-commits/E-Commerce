// สร้างฐานข้อมูลใหม่จาก db/schema.sql แล้วใส่ข้อมูลสินค้าตัวอย่าง
// รัน: npm run db:seed   (ลบข้อมูลเดิมทั้งหมดทุกครั้ง)
// ข้อมูลทั้งหมดเป็นตัวอย่างสมมติ ไม่ใช่ผลิตภัณฑ์จริง

import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = process.env.DATABASE_PATH ?? path.join(root, "data", "shop.db");
const schema = fs.readFileSync(path.join(root, "db", "schema.sql"), "utf8");

const catalog = [
  {
    category: "วิตามินและแร่ธาตุ",
    products: [
      { name: "วิตามินซี 1,000 มก. (60 เม็ด)", price: 259, stock: 48,
        description: "วิตามินซีชนิดเม็ด ปริมาณ 1,000 มก. ต่อเม็ด บรรจุ 60 เม็ด รับประทานง่าย เหมาะเป็นวิตามินประจำวัน" },
      { name: "วิตามินดี 3 2,000 IU (90 ซอฟต์เจล)", price: 329, stock: 35,
        description: "วิตามินดี 3 แบบซอฟต์เจลในน้ำมันมะกอก ปริมาณ 2,000 IU ต่อเม็ด บรรจุ 90 เม็ด" },
      { name: "แมกนีเซียม ซิเตรต 400 มก. (60 แคปซูล)", price: 389, stock: 22,
        description: "แมกนีเซียมในรูปซิเตรต ปริมาณ 400 มก. ต่อแคปซูล บรรจุ 60 แคปซูล" },
      { name: "วิตามินบีรวม (100 เม็ด)", price: 299, stock: 8,
        description: "วิตามินบีรวมครบ 8 ชนิดในเม็ดเดียว บรรจุ 100 เม็ด รับประทานวันละ 1 เม็ดพร้อมอาหาร" },
    ],
  },
  {
    category: "น้ำมันปลาและโอเมก้า-3",
    products: [
      { name: "น้ำมันปลา 1,000 มก. (100 ซอฟต์เจล)", price: 459, stock: 60,
        description: "น้ำมันปลาทะเลน้ำลึก 1,000 มก. ต่อเม็ด มี EPA และ DHA บรรจุ 100 ซอฟต์เจล กลิ่นคาวน้อย" },
      { name: "น้ำมันปลาเข้มข้น EPA/DHA 1,200 มก. (60 ซอฟต์เจล)", price: 689, stock: 25,
        description: "สูตรเข้มข้น ให้ EPA และ DHA รวม 1,200 มก. ต่อเม็ด เคลือบเอนเทอริกเพื่อลดกลิ่นคาว บรรจุ 60 ซอฟต์เจล" },
      { name: "น้ำมันคริลล์ 500 มก. (30 ซอฟต์เจล)", price: 899, stock: 12,
        description: "น้ำมันคริลล์จากแอนตาร์กติก ปริมาณ 500 มก. ต่อเม็ด บรรจุ 30 ซอฟต์เจล เม็ดเล็ก กลืนง่าย" },
    ],
  },
  {
    category: "โปรตีนและฟิตเนส",
    products: [
      { name: "เวย์โปรตีนไอโซเลต รสช็อกโกแลต (2 ปอนด์)", price: 1490, stock: 18,
        description: "เวย์โปรตีนไอโซเลต ให้โปรตีน 27 กรัมต่อ 1 สกู๊ป ไขมันและน้ำตาลต่ำ รสช็อกโกแลต ขนาด 2 ปอนด์ (ประมาณ 29 สกู๊ป)" },
      { name: "โปรตีนจากพืช รสวานิลลา (1 กก.)", price: 1190, stock: 14,
        description: "โปรตีนจากถั่วลันเตาและข้าวกล้อง ให้โปรตีน 24 กรัมต่อ 1 สกู๊ป ไม่มีแลคโตส ขนาด 1 กิโลกรัม" },
      { name: "ครีเอทีน โมโนไฮเดรต (300 กรัม)", price: 790, stock: 0,
        description: "ครีเอทีนโมโนไฮเดรตชนิดผง ไม่มีรสชาติ ละลายน้ำง่าย ขนาด 300 กรัม" },
    ],
  },
  {
    category: "ผิวพรรณและความงาม",
    products: [
      { name: "คอลลาเจนไดเปปไทด์ ชนิดผง (200 กรัม)", price: 790, stock: 30,
        description: "คอลลาเจนไดเปปไทด์ชนิดผง ชงดื่มง่าย รสน้ำผึ้งมะนาว ขนาด 200 กรัม" },
      { name: "ไบโอติน 5,000 mcg (90 เม็ด)", price: 349, stock: 40,
        description: "ไบโอตินปริมาณ 5,000 ไมโครกรัมต่อเม็ด บรรจุ 90 เม็ด รับประทานวันละ 1 เม็ด" },
      { name: "กรดไฮยาลูโรนิก 150 มก. (30 แคปซูล)", price: 599, stock: 9,
        description: "กรดไฮยาลูโรนิกชนิดแคปซูล ปริมาณ 150 มก. ต่อแคปซูล บรรจุ 30 แคปซูล" },
    ],
  },
  {
    category: "โปรไบโอติกและสมุนไพร",
    products: [
      { name: "โปรไบโอติก 10 สายพันธุ์ (30 แคปซูล)", price: 690, stock: 26,
        description: "จุลินทรีย์โปรไบโอติก 10 สายพันธุ์ ปริมาณ 20,000 ล้าน CFU ต่อแคปซูล บรรจุ 30 แคปซูล" },
      { name: "เคอร์คูมินสกัดจากขมิ้นชัน 500 มก. (60 แคปซูล)", price: 459, stock: 33,
        description: "สารสกัดเคอร์คูมินจากขมิ้นชัน ปริมาณ 500 มก. ต่อแคปซูล ผสมพิเพอรีนจากพริกไทยดำ บรรจุ 60 แคปซูล" },
      { name: "ไฟเบอร์ผสมพรีไบโอติก ชนิดผง (20 ซอง)", price: 399, stock: 45,
        description: "ใยอาหารชนิดผงผสมพรีไบโอติก ชงน้ำดื่มง่าย รสส้ม บรรจุ 20 ซอง" },
    ],
  },
];

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
for (const suffix of ["", "-wal", "-shm"]) fs.rmSync(dbPath + suffix, { force: true });

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");
db.exec(schema);

const insertCategory = db.prepare("INSERT INTO categories (name, sort_order) VALUES (?, ?)");
const insertProduct = db.prepare(
  `INSERT INTO products (name, description, price, category_id, stock)
   VALUES (@name, @description, @price, @category_id, @stock)`,
);

db.transaction(() => {
  catalog.forEach((group, index) => {
    const { lastInsertRowid } = insertCategory.run(group.category, index + 1);
    for (const product of group.products) {
      insertProduct.run({ ...product, category_id: Number(lastInsertRowid) });
    }
  });
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
db.close();
