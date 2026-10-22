import "server-only";
import { signSession, verifySession } from "./session-security";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getDb } from "./db";
import { recordLoginAttempt } from "./auth-throttle";

export type User = {
  id: number;
  name: string;
  email: string;
  role: "customer" | "admin";
  created_at: string;
};

const SESSION_COOKIE_NAME = "vitashop_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 วัน

export function getUserById(id: number): User | null {
  const row = getDb()
    .prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?")
    .get(id) as User | undefined;
  return row ?? null;
}

export function getUserByEmail(email: string): (User & { password_hash: string }) | null {
  const row = getDb()
    .prepare("SELECT id, name, email, password_hash, role, created_at FROM users WHERE LOWER(email) = LOWER(?)")
    .get(email) as (User & { password_hash: string }) | undefined;
  return row ?? null;
}

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export async function registerUser(name: string, email: string, password: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanName || cleanName.length > 100) throw new Error("กรุณากรอกชื่อไม่เกิน 100 ตัวอักษร");
  if (cleanEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new Error("กรุณากรอกอีเมลให้ถูกต้อง");
  if (!password || password.length < 8 || Buffer.byteLength(password, "utf8") > 72) throw new Error("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และไม่เกิน 72 ไบต์");

  const existing = getUserByEmail(cleanEmail);
  if (existing) {
    throw new Error("อีเมลนี้ถูกใช้งานแล้ว");
  }

  const passwordHash = await hashPassword(password);
  const result = getDb()
    .prepare(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'customer')"
    )
    .run(cleanName, cleanEmail, passwordHash);

  const newUser = getUserById(Number(result.lastInsertRowid));
  if (!newUser) throw new Error("ไม่สามารถสร้างบัญชีผู้ใช้ได้");
  return newUser;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail.length > 254 || password.length > 256) throw new Error("ข้อมูลเข้าสู่ระบบไม่ถูกต้อง");
  const attemptKey = recordLoginAttempt(getDb(), cleanEmail);
  const user = getUserByEmail(cleanEmail);
  if (!user) {
    throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  }

  if (process.env.NODE_ENV === "production" && ["admin@vitashop.com", "customer@vitashop.com"].includes(cleanEmail) && await verifyPassword("123456", user.password_hash)) {
    throw new Error("บัญชีสาธิตเดิมไม่สามารถใช้บนระบบออนไลน์ กรุณาเปลี่ยนรหัสผ่านผ่านผู้ดูแล");
  }
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  }

  getDb().prepare("DELETE FROM auth_attempts WHERE key = ?").run(attemptKey);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };
}

export async function setSessionCookie(userId: number) {
  const cookieStore = await cookies();
  const token = signSession({
    userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  });

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!tokenCookie || !tokenCookie.value) return null;

  const payload = verifySession(tokenCookie.value);
  if (!payload) return null;

  return getUserById(payload.userId);
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/admin");
  }
  if (user.role !== "admin") {
    redirect("/");
  }
  return user;
}
