import { catalog } from "./yadom-catalog.mjs";

// Replace only our original sample pictures; preserve photos subsequently set by admins.
export function applyProductPhotos(db) {
  let updated = 0;
  db.transaction(() => {
    // The old sample described a jar without a verified matching photo. Use this
    // documented Siang Pure model instead, retaining its ID and historical orders.
    const replacement = catalog.flatMap((group) => group.products)
      .find((product) => product.name === "เซียงเพียว ยาดมน้ำ กลิ่นยูคาลิปตัส ชนิดลูกกลิ้ง");
    const category = db.prepare("SELECT id FROM categories WHERE name = ?").get("ยาดมกลิ่นอโรมา");
    if (replacement && category) {
      updated += db.prepare(`UPDATE products SET name = ?, description = ?, category_id = ?, image_url = ?
        WHERE name = ? AND image_url = ?`).run(replacement.name, replacement.description, category.id,
        replacement.image_url, "เซียงเพียว ยาดมสมุนไพร", "/products/herbal-amber.svg").changes;
    }
    const update = db.prepare(`UPDATE products SET image_url = ? WHERE name = ?
      AND (image_url IS NULL OR image_url IN (
        '/products/herbal-green.svg', '/products/herbal-black.svg', '/products/tube-classic.svg',
        '/products/tube-red.svg', '/products/tube-mint.svg', '/products/tube-black.svg', '/products/tube-orange.svg'
      ))`);
    for (const product of catalog.flatMap((group) => group.products)) {
      updated += update.run(product.image_url, product.name).changes;
    }
  })();
  return updated;
}
