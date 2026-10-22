import Database from "better-sqlite3";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) throw new Error("ใช้ npm run account:reset -- admin@example.com");
const databasePath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "shop.db");
const db = new Database(databasePath, { fileMustExist: true });
try {
  const user = db.prepare("SELECT id FROM users WHERE LOWER(email) = ?").get(email);
  if (!user) throw new Error("ไม่พบบัญชีนี้ ไม่มีข้อมูลถูกเปลี่ยน");
  const password = crypto.randomBytes(18).toString("base64url");
  const target = path.join(path.dirname(databasePath), "local-accounts.txt");
  // Store privately before changing the account, so filesystem failures cannot lose the password.
  fs.appendFileSync(target, `\n${email}: ${password}\n`);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(bcrypt.hashSync(password, 12), user.id);
  console.log(`Password replaced. Read the private credentials file: ${target}. Account and orders preserved.`);
} finally { db.close(); }
