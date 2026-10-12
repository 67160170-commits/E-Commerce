import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "shop.db");

// เก็บการเชื่อมต่อไว้ใน globalThis เพื่อไม่ให้เปิดซ้ำทุกครั้งที่ hot reload
const globalForDb = globalThis as unknown as { __shopDb?: Database.Database };

export function getDb(): Database.Database {
  if (!globalForDb.__shopDb) {
    if (!fs.existsSync(/* turbopackIgnore: true */ DB_PATH)) {
      throw new Error("ไม่พบฐานข้อมูล กรุณารัน `npm run db:seed` ก่อน");
    }
    const db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    globalForDb.__shopDb = db;
  }
  return globalForDb.__shopDb;
}
