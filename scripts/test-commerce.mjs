import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Database from "better-sqlite3";
import { createPurchase, changeOrderStatus, archiveProduct, categorySales, cartIssue } from "../src/lib/commerce.ts";
import { signSession, verifySession } from "../src/lib/session-security.ts";
import { safeRedirect } from "../src/lib/safe-redirect.ts";
import { recordLoginAttempt } from "../src/lib/auth-throttle.ts";
import { rankProducts } from "../src/lib/ranking.ts";

function fixture() {
  const db = new Database(":memory:");
  db.exec(fs.readFileSync("db/schema.sql", "utf8"));
  db.exec(fs.readFileSync("db/reviews.sql", "utf8"));
  db.exec(`INSERT INTO users (name,email,password_hash) VALUES ('Tester','test@example.test','fixture');
    INSERT INTO categories (name) VALUES ('Inhalers');
    INSERT INTO products (name,price,category_id,stock) VALUES ('A',25,1,10),('B',40,1,2);`);
  return db;
}
const purchase = (db, items = [{productId:1,quantity:2}], paymentMethod = "cod") => createPurchase(db, {userId:1,shippingAddress:"Test address",paymentMethod,items});

test("purchase and cancellation restore stock once; terminal orders cannot reopen", () => {
  const db=fixture();
  try {
    const id=purchase(db);
    assert.equal(db.prepare("SELECT stock FROM products WHERE id=1").get().stock,8);
    changeOrderStatus(db,id,"cancelled"); changeOrderStatus(db,id,"cancelled");
    assert.equal(db.prepare("SELECT stock FROM products WHERE id=1").get().stock,10);
    assert.throws(()=>changeOrderStatus(db,id,"pending"));
    const shipped=purchase(db); changeOrderStatus(db,shipped,"shipped","TRACK123");
    assert.throws(()=>changeOrderStatus(db,shipped,"cancelled"));
    changeOrderStatus(db,shipped,"delivered");
    assert.throws(()=>changeOrderStatus(db,shipped,"paid"));
  } finally { db.close(); }
});
test("aggregate duplicate product lines; reject overselling and fractional/invalid quantities atomically", () => {
  const db=fixture();
  try {
    for(const items of [[{productId:1,quantity:6},{productId:1,quantity:6}],[{productId:1,quantity:1.5}],[{productId:1,quantity:0}],[{productId:1,quantity:2},{productId:2,quantity:3}]]) assert.throws(()=>purchase(db,items));
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM orders").get().n,0);
    assert.equal(db.prepare("SELECT stock FROM products WHERE id=1").get().stock,10);
    purchase(db,[{productId:1,quantity:2},{productId:1,quantity:3}]);
    assert.equal(db.prepare("SELECT stock FROM products WHERE id=1").get().stock,5);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM order_items").get().n,1);
    const transfer=purchase(db,[{productId:1,quantity:1}],"bank_transfer");
    assert.throws(()=>changeOrderStatus(db,transfer,"shipped"));
    changeOrderStatus(db,transfer,"paid");changeOrderStatus(db,transfer,"shipped");
  } finally { db.close(); }
});
test("archive preserves reviews; category revenue excludes pending and cancelled orders", () => {
  const db=fixture();
  try {
    purchase(db); const paid=purchase(db); changeOrderStatus(db,paid,"paid");
    const cancelled=purchase(db);changeOrderStatus(db,cancelled,"cancelled");
    assert.equal(categorySales(db)[0].total_revenue,50);
    db.prepare("INSERT INTO reviews (product_id,user_id,rating) VALUES (2,1,5)").run();
    archiveProduct(db,2);
    assert.equal(db.prepare("SELECT is_active FROM products WHERE id=2").get().is_active,0);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM reviews").get().n,1);
    assert.throws(()=>purchase(db,[{productId:2,quantity:1}]));
    assert.deepEqual(db.pragma("foreign_key_check"),[]);
  } finally { db.close(); }
});
test("only same-origin redirect paths are accepted", () => {
  for(const bad of ["https://evil.test","//evil.test","/\\evil.test","/%2f%2fevil.test","/%5cevil.test","/\n/evil.test",null]) assert.equal(safeRedirect(bad),"/");
  assert.equal(safeRedirect("/products/17#reviews"),"/products/17#reviews");
});
test("session rejects expired, forged, malformed and multibyte signatures without throwing", () => {
  const previous=process.env.SESSION_SECRET;
  try {
    process.env.SESSION_SECRET="test-only-secret-with-more-than-32-characters";
    const token=signSession({userId:1,exp:Math.floor(Date.now()/1000)+60});
    assert.equal(verifySession(token)?.userId,1);
    assert.equal(verifySession(signSession({userId:1,exp:1})),null);
    assert.equal(verifySession(token.replace(/.$/,"!")),null);
    assert.equal(verifySession(token.split(".")[0]+"."+"ก".repeat(43)),null);
    assert.equal(verifySession(signSession({userId:-1,exp:9999999999})),null);
    delete process.env.SESSION_SECRET;
    assert.throws(()=>signSession({userId:1,exp:9999999999}));
  } finally { if(previous===undefined)delete process.env.SESSION_SECRET;else process.env.SESSION_SECRET=previous; }
});
test("login attempts are persisted, throttled and expire", () => {
  const db=fixture();
  try {
    for(let i=0;i<10;i++)recordLoginAttempt(db,"Test@Example.test",1000);
    assert.throws(()=>recordLoginAttempt(db,"test@example.test",1001));
    assert.doesNotThrow(()=>recordLoginAttempt(db,"other@example.test",1001));
    assert.doesNotThrow(()=>recordLoginAttempt(db,"test@example.test",1901));
  } finally { db.close(); }
});
test("rankings require three ratings and use vote count to break equal-score ties", () => {
  const ranked=rankProducts([{id:1,average_rating:5,review_count:1},{id:2,average_rating:4.5,review_count:3},{id:3,average_rating:4.5,review_count:5},{id:4,average_rating:null,review_count:0}]);
  assert.deepEqual(ranked.map(p=>p.id),[3,2]);
});

test("cart explicitly blocks unavailable or reduced-stock items without silently changing quantities", () => {
  assert.ok(cartIssue({stock:0,is_active:1},1));
  assert.ok(cartIssue({stock:10,is_active:0},1));
  assert.ok(cartIssue({stock:2,is_active:1},3));
  assert.equal(cartIssue({stock:2,is_active:1},2),undefined);
});
