import type Database from "better-sqlite3";
import crypto from "node:crypto";

const WINDOW_SECONDS = 15 * 60;
export function recordLoginAttempt(db: Database.Database, email: string, now = Math.floor(Date.now() / 1000)) {
  const key = crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
  db.prepare("DELETE FROM auth_attempts WHERE started_at <= ?").run(now - WINDOW_SECONDS);
  const row = db.prepare("SELECT attempts FROM auth_attempts WHERE key = ?").get(key) as { attempts: number } | undefined;
  if (row && row.attempts >= 10) throw new Error("ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอ 15 นาที");
  db.prepare(`INSERT INTO auth_attempts (key, attempts, started_at) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET attempts = attempts + 1`).run(key, now);
  return key;
}
