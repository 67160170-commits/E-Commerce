import type { Metadata } from "next";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import QuickStockUpdater from "@/components/admin/QuickStockUpdater";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { listAdminProducts } from "@/lib/admin";
import { listCategories } from "@/lib/products";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "จัดการสินค้าและสต็อก (Inventory)",
};

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; low_stock?: string }>;
}) {
  const { q, category, low_stock } = await searchParams;
  const categoryId = category ? Number(category) : undefined;
  const lowStockOnly = low_stock === "1";

  const categories = listCategories();
  const products = listAdminProducts({
    q,
    categoryId: Number.isInteger(categoryId) ? categoryId : undefined,
    lowStockOnly,
  });

  const allProducts = listAdminProducts();
  const lowStockCount = allProducts.filter(
    (p) => p.is_active === 1 && p.stock <= p.low_stock_threshold && p.stock > 0
  ).length;
  const outOfStockCount = allProducts.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-6">
      {/* การ์ดสรุปสถานะสต็อก */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-ink-soft">สินค้าที่เปิดจำหน่ายทั้งหมด</p>
          <p className="mt-1 text-2xl font-bold text-ink">
            {allProducts.filter((p) => p.is_active === 1).length} รายการ
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-xs">
          <p className="text-xs font-semibold text-amber-800">สินค้าใกล้หมด (สต็อกต่ำกว่าเกณฑ์)</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{lowStockCount} รายการ</p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5 shadow-xs">
          <p className="text-xs font-semibold text-red-800">สินค้าหมดสต็อก (พร้อมเติมของ)</p>
          <p className="mt-1 text-2xl font-bold text-red-700">{outOfStockCount} รายการ</p>
        </div>
      </div>

      {/* แถบเครื่องมือ ค้นหา กรอง และปุ่มเพิ่มสินค้า */}
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <form className="flex flex-wrap items-center gap-3 text-sm">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="ค้นหาชื่อสินค้า..."
            className="rounded-xl border border-line bg-paper px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />

          <select
            name="category"
            defaultValue={category ?? ""}
            className="rounded-xl border border-line bg-paper px-3 py-2 text-sm focus:border-brand focus:outline-none"
          >
            <option value="">ทุกหมวดหมู่</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-ink">
            <input
              type="checkbox"
              name="low_stock"
              value="1"
              defaultChecked={lowStockOnly}
              className="rounded border-line text-brand focus:ring-brand"
            />
            ดูเฉพาะสินค้าสต็อกต่ำ
          </label>

          <button
            type="submit"
            className="rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-white hover:bg-brand transition-colors"
          >
            กรองข้อมูล
          </button>

          {(q || category || lowStockOnly) && (
            <Link
              href="/admin/inventory"
              className="text-xs font-medium text-ink-soft hover:text-red-600 underline"
            >
              ล้างตัวกรอง
            </Link>
          )}
        </form>

        <Link
          href="/admin/inventory/new"
          id="btn-add-product"
          className="inline-flex items-center gap-1.5 self-start rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-deep sm:self-auto"
        >
          <span>＋ เพิ่มสินค้าใหม่</span>
        </Link>
      </div>

      {/* ตารางรายการสินค้า */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-ink">
            <thead className="border-b border-line bg-paper/60 text-xs font-bold uppercase text-ink-soft">
              <tr>
                <th scope="col" className="px-4 py-3.5">
                  สินค้า
                </th>
                <th scope="col" className="px-4 py-3.5">
                  ราคา
                </th>
                <th scope="col" className="px-4 py-3.5">
                  สต็อกคงเหลือ
                </th>
                <th scope="col" className="px-4 py-3.5">
                  เกณฑ์สต็อกต่ำ
                </th>
                <th scope="col" className="px-4 py-3.5">
                  สถานะ
                </th>
                <th scope="col" className="px-4 py-3.5 text-right">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-ink-soft">
                    ไม่พบรายการสินค้าที่ค้นหา
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = p.stock <= p.low_stock_threshold && p.stock > 0;
                  const isOut = p.stock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-paper/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <ProductImage
                            categoryId={p.category_id}
                            imageUrl={p.image_url}
                            alt={p.name}
                            className="h-12 w-12 shrink-0 rounded-lg border border-line object-cover"
                          />
                          <div>
                            <span className="text-xs text-ink-soft">{p.category_name}</span>
                            <p className="font-semibold text-ink line-clamp-1">{p.name}</p>
                            <span className="text-[11px] text-ink-soft font-mono">ID: {p.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-bold font-mono">
                        {formatPrice(p.price)}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <QuickStockUpdater
                            productId={p.id}
                            initialStock={p.stock}
                            lowStockThreshold={p.low_stock_threshold}
                          />
                          {isOut ? (
                            <span className="inline-block rounded bg-red-100 px-1.5 py-0.5 text-[11px] font-bold text-red-700 w-fit">
                              หมดสต็อก
                            </span>
                          ) : isLow ? (
                            <span className="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-800 w-fit">
                              สต็อกเหลือน้อย
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-xs text-ink-soft">
                        ≤ {p.low_stock_threshold} ชิ้น
                      </td>

                      <td className="px-4 py-3.5">
                        {p.is_active === 1 ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                            เปิดจำหน่าย
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                            ปิดจำหน่าย
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/inventory/${p.id}/edit`}
                            className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-ink hover:border-brand hover:text-brand"
                          >
                            แก้ไข
                          </Link>
                          <DeleteProductButton productId={p.id} productName={p.name} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
