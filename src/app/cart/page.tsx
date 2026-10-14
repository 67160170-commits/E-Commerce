import type { Metadata } from "next";
import Link from "next/link";
import CartItemRow from "@/components/CartItemRow";
import { getPopulatedCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ตะกร้าสินค้า",
  description: "รายการสินค้าในตะกร้าของคุณ พร้อมสรุปยอดและดำเนินการสั่งซื้อ",
};

export default async function CartPage() {
  const { items, total, itemCount } = await getPopulatedCart();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <h1 className="text-2xl font-bold text-ink">ตะกร้าสินค้า</h1>
        {itemCount > 0 && (
          <span className="text-sm text-ink-soft">ทั้งหมด {itemCount} ชิ้น</span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="my-16 flex flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-paper border border-line text-ink-soft">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-bold text-ink">ยังไม่มีสินค้าในตะกร้า</h2>
          <p className="mt-2 text-sm text-ink-soft max-w-sm">
            เลือกดูวิตามินและอาหารเสริมเพื่อสุขภาพที่คุณต้องการ แล้วเพิ่มลงตะกร้าได้เลย
          </p>
          <Link
            href="/"
            className="mt-6 rounded-xl bg-brand px-6 py-3 font-semibold text-white shadow-sm hover:bg-brand-deep"
          >
            เลือกซื้อสินค้า
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          {/* รายการสินค้า */}
          <div className="flex flex-col gap-3 lg:col-span-2">
            {items.map((item) => (
              <CartItemRow key={item.product.id} item={item} />
            ))}

            <div className="mt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
              >
                ← เลือกซื้อสินค้าเพิ่มเติม
              </Link>
            </div>
          </div>

          {/* สรุปยอดสั่งซื้อ */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-ink">สรุปคำสั่งซื้อ</h2>

              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between text-ink-soft">
                  <dt>ยอดรวมสินค้า ({itemCount} ชิ้น)</dt>
                  <dd className="font-medium text-ink">{formatPrice(total)}</dd>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <dt>ค่าจัดส่ง</dt>
                  <dd className="font-medium text-emerald-700">ส่งฟรีทุกออเดอร์</dd>
                </div>
                <div className="border-t border-line pt-3 flex justify-between text-base font-bold text-ink">
                  <dt>ยอดชำระสุทธิ</dt>
                  <dd className="text-xl text-brand-deep">{formatPrice(total)}</dd>
                </div>
              </dl>

              <Link
                href="/checkout"
                id="proceed-checkout-btn"
                className="mt-6 block w-full rounded-xl bg-brand py-3.5 text-center font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep"
              >
                ดำเนินการสั่งซื้อ
              </Link>

              <p className="mt-3 text-center text-xs text-ink-soft">
                รองรับการชำระเงินปลายทาง (COD) และโอนเงินผ่านธนาคาร
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
