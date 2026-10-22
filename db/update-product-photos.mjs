import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyProductPhotos } from "./apply-product-photos.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const db = new Database(process.env.DATABASE_PATH ?? path.join(root, "data", "shop.db"), { fileMustExist: true });
db.pragma("foreign_keys = ON");
console.log(`Updated ${applyProductPhotos(db)} sample product photos. Accounts, stock, orders and reviews preserved.`);
db.close();
