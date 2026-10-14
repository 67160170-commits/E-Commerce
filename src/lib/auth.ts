import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getDb } from "./db";

export type User = {
  id: number;
  name: string;
  email: string;
  role: "customer" | "admin";
  created_at: string;
};

const SESSION_COOKIE_NAME = "vitashop_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "vitashop-super-secret-key-67160170";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 วัน

type SessionPayload = {
  userId: number;
  exp: number;
};

function sign(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

function verify(token: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("base64url");

  // ป้องกัน timing attack
  if (
    signature.length !== expectedSig.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

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

  if (!cleanName) throw new Error("กรุณากรอกชื่อ-นามสกุล");
  if (!cleanEmail || !cleanEmail.includes("@")) throw new Error("กรุณากรอกอีเมลให้ถูกต้อง");
  if (!password || password.length < 6) throw new Error("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");

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
  const user = getUserByEmail(cleanEmail);
  if (!user) {
    throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  }

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
  const token = sign({
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

  const payload = verify(tokenCookie.value);
  if (!payload) return null;

  return getUserById(payload.userId);
}
