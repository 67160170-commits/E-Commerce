import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

test("migration preserves accounts, historical orders and product IDs; reruns do not duplicate products", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "my-yadom-test-"));
  const databasePath = path.join(directory, "fixture.db");
  let db;
  try {
    db = new Database(databasePath);
    db.exec(fs.readFileSync("db/schema.sql", "utf8"));
    db.exec(`INSERT INTO users (name, email, password_hash) VALUES ('Original Customer', 'fixture@example.test', 'fixture');
      INSERT INTO categories (name) VALUES ('Original category');
      INSERT INTO products (name, price, category_id, stock) VALUES ('Original product', 259, 1, 7);
      INSERT INTO orders (user_id, total, shipping_address) VALUES (1, 259, 'Original address');
      INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (1, 1, 1, 259);`);
    const before = Object.fromEntries(["users", "orders", "order_items"].map((table) => [table, db.prepare(`SELECT * FROM ${table}`).all()]));
    db.close();
    const migrate = () => {
      const result = spawnSync(process.execPath, ["db/migrate-yadom.mjs"], {
        env: { ...process.env, DATABASE_PATH: databasePath }, encoding: "utf8",
      });
      assert.equal(result.status, 0, result.stderr);
    };
    migrate();
    migrate();
    db = new Database(databasePath);
    for (const [table, rows] of Object.entries(before)) assert.deepEqual(db.prepare(`SELECT * FROM ${table}`).all(), rows);
    assert.equal(db.prepare("SELECT name FROM products WHERE id = 1").get().name, "Original product");
    assert.equal(db.prepare("SELECT is_active FROM products WHERE id = 1").get().is_active, 0);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM products WHERE is_active = 1").get().n, 10);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM reviews").get().n, 0);
    assert.equal(fs.readdirSync(directory).filter((name) => name.includes("before-yadom") && name.endsWith(".bak")).length, 1);
    assert.deepEqual(db.pragma("foreign_key_check"), []);

    // Database invariants protect against direct writes as well as invalid form input.
    const insert = db.prepare("INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (2, 1, ?, ?)");
    assert.throws(() => insert.run(0, "invalid"));
    assert.throws(() => insert.run(6, "invalid"));
    assert.throws(() => insert.run(5, "x".repeat(501)));
    insert.run(4, "fixture review");
    assert.throws(() => insert.run(5, "duplicate vote"));
    db.prepare("UPDATE reviews SET rating = 5 WHERE product_id = 2 AND user_id = 1").run();
    assert.equal(db.prepare("SELECT COUNT(*) AS n, AVG(rating) AS score FROM reviews WHERE product_id = 2").get().score, 5);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM reviews WHERE product_id = 2").get().n, 1);
    db.close();
    db = undefined;
  } finally {
    if (db?.open) db.close();
    const resolved = path.resolve(directory);
    assert.ok(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep));
    for (const file of fs.readdirSync(resolved)) {
      const target = path.resolve(resolved, file);
      assert.equal(path.dirname(target), resolved);
      fs.rmSync(target);
    }
    fs.rmdirSync(resolved);
  }
});

test("fresh install seeds six brands with private random account passwords", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "my-yadom-seed-"));
  const databasePath = path.join(directory, "fixture.db");
  let db;
  try {
    const result = spawnSync(process.execPath, ["db/seed.mjs"], {
      env: { ...process.env, DATABASE_PATH: databasePath, SEED_ADMIN_PASSWORD: "" }, encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    db = new Database(databasePath);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM products WHERE is_active = 1").get().n, 10);
    assert.equal(db.prepare("SELECT COUNT(DISTINCT brand) AS n FROM products WHERE is_active = 1").get().n, 6);
    const users = db.prepare("SELECT email, password_hash FROM users").all();
    const credentials = fs.readFileSync(path.join(directory, "local-accounts.txt"), "utf8");
    for (const user of users) {
      const password = credentials.split("\n").find(line => line.startsWith(user.email + ": "))?.split(": ")[1];
      assert.ok(password && password.length >= 12);
      assert.equal(bcrypt.compareSync(password, user.password_hash), true);
      assert.equal(bcrypt.compareSync("123456", user.password_hash), false);
      assert.ok(!result.stdout.includes(password));
    }
    db.close(); db = undefined;
  } finally {
    if (db?.open) db.close();
    const resolved = path.resolve(directory);
    assert.ok(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep));
    for (const file of fs.readdirSync(resolved)) {
      const target = path.resolve(resolved, file);
      assert.equal(path.dirname(target), resolved);
      fs.rmSync(target);
    }
    fs.rmdirSync(resolved);
  }
});
