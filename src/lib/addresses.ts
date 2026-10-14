import "server-only";
import { getDb } from "./db";

export type Address = {
  id: number;
  user_id: number;
  recipient_name: string;
  phone: string;
  address_line: string;
  is_default: number;
};

export function getUserAddresses(userId: number): Address[] {
  return getDb()
    .prepare(
      "SELECT id, user_id, recipient_name, phone, address_line, is_default FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC"
    )
    .all(userId) as Address[];
}

export function getDefaultAddress(userId: number): Address | null {
  const row = getDb()
    .prepare(
      "SELECT id, user_id, recipient_name, phone, address_line, is_default FROM addresses WHERE user_id = ? AND is_default = 1 LIMIT 1"
    )
    .get(userId) as Address | undefined;
  return row ?? null;
}

export function createAddress(
  userId: number,
  recipientName: string,
  phone: string,
  addressLine: string,
  isDefault = false
): Address {
  const db = getDb();
  return db.transaction(() => {
    if (isDefault) {
      db.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?").run(userId);
    } else {
      // หากยังไม่มีที่อยู่เลย ให้ตัวแรกเป็น default เสมอ
      const count = db
        .prepare("SELECT COUNT(*) AS c FROM addresses WHERE user_id = ?")
        .get(userId) as { c: number };
      if (count.c === 0) isDefault = true;
    }

    const result = db
      .prepare(
        "INSERT INTO addresses (user_id, recipient_name, phone, address_line, is_default) VALUES (?, ?, ?, ?, ?)"
      )
      .run(userId, recipientName.trim(), phone.trim(), addressLine.trim(), isDefault ? 1 : 0);

    return db
      .prepare("SELECT id, user_id, recipient_name, phone, address_line, is_default FROM addresses WHERE id = ?")
      .get(Number(result.lastInsertRowid)) as Address;
  })();
}

export function deleteAddress(addressId: number, userId: number): void {
  const db = getDb();
  db.transaction(() => {
    const address = db
      .prepare("SELECT is_default FROM addresses WHERE id = ? AND user_id = ?")
      .get(addressId, userId) as { is_default: number } | undefined;

    if (!address) return;

    db.prepare("DELETE FROM addresses WHERE id = ? AND user_id = ?").run(addressId, userId);

    if (address.is_default === 1) {
      // ตั้งที่อยู่อื่นเป็น default แทน
      db.prepare(
        "UPDATE addresses SET is_default = 1 WHERE id = (SELECT id FROM addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1)"
      ).run(userId);
    }
  })();
}

export function setDefaultAddress(addressId: number, userId: number): void {
  const db = getDb();
  db.transaction(() => {
    db.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?").run(userId);
    db.prepare("UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?").run(
      addressId,
      userId
    );
  })();
}
