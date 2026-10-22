import crypto from "node:crypto";

export type SessionPayload = { userId: number; exp: number };

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("กรุณาตั้ง SESSION_SECRET อย่างน้อย 32 ตัวอักษรด้วย npm run setup");
  return value;
}

export function signSession(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${crypto.createHmac("sha256", secret()).update(data).digest("base64url")}`;
}

export function verifySession(token: string): SessionPayload | null {
  if (typeof token !== "string" || token.length > 1024) return null;
  const [data, signature, extra] = token.split(".");
  if (!data || !signature || extra !== undefined) return null;
  const expected = crypto.createHmac("sha256", secret()).update(data).digest("base64url");
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length || !crypto.timingSafeEqual(actualBytes, expectedBytes)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (!Number.isSafeInteger(payload.userId) || payload.userId < 1 || !Number.isSafeInteger(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return { userId: payload.userId, exp: payload.exp };
  } catch { return null; }
}
