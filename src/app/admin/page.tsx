import type { Metadata } from "next";
import Link from "next/link";
import { getAdminDashboardData } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "แดชบอร์ดภาพรวมยอดขายและคลังสินค้า",
};

const STATUS_BADGES: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending: { label: "รอดำเนินการ", bg: "bg-amber-100", text: "text-amber-800" },
  paid: { label: "ชำระแล้ว", bg: "bg-blue-100", text: "text-blue-800" },
  shipped: { label: "กำลังจัดส่ง", bg: "bg-purple-100", text: "text-purple-800" },
  delivered: { label: "จัดส่งสำเร็จ", bg: "bg-emerald-100", text: "text-emerald-800" },
  cancelled: { label: "ยกเลิก", bg: "bg-red-100", text: "text-red-800" },
};

export default async function AdminDashboardPage() {
  const data = getAdminDashboardData();
  const maxCategoryRevenue = Math.max(
    1,
    ...data.salesByCategory.map((c) => c.total_revenue)
  );

  return (
    <div className="space-y-8">
      {/* ส่วนหัวแดชบอร์ด */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">ภาพรวมธุรกิจและคลังสินค้า</h2>
          <p className="text-xs text-ink-soft">
            สรุปยอดขาย สถานะคำสั่งซื้อ และแจ้งเตือนสต็อกสินค้า
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/inventory/new"
            className="rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-deep"
          >
            ＋ เพิ่มสินค้าใหม่
          </Link>
          <Link
            href="/admin/orders?status=pending"
            className="rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink hover:border-brand hover:text-brand"
          >
            ออเดอร์รอดำเนินการ ({data.ordersByStatus.pending})
          </Link>
        </div>
      </div>

      {/* การ์ดสถิติหลัก 4 ใบ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* รายได้สุทธิ */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              ยอดขายที่ชำระแล้ว
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 font-bold">
              ฿
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-emerald-800">
            {formatPrice(data.totalRevenue)}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            รอดำเนินการชำระ: <span className="font-semibold text-amber-700 font-mono">{formatPrice(data.pendingRevenue)}</span>
          </p>
        </div>

        {/* คำสั่งซื้อทั้งหมด */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              คำสั่งซื้อทั้งหมด
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold">
              📋
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-ink">
            {data.totalOrders} ออเดอร์
          </p>
          <div className="mt-1 flex gap-2 text-xs text-ink-soft">
            <span className="text-blue-700 font-medium">สำเร็จ: {data.ordersByStatus.delivered}</span>
            <span>•</span>
            <span className="text-purple-700 font-medium">กำลังส่ง: {data.ordersByStatus.shipped}</span>
          </div>
        </div>

        {/* สินค้าในระบบ */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              สินค้าที่เปิดขาย
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-brand font-bold">
              💊
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-ink">
            {data.totalProducts} รายการ
          </p>
          <Link
            href="/admin/inventory"
            className="mt-1 inline-block text-xs font-medium text-brand hover:underline"
          >
            ดูคลังสินค้าทั้งหมด →
          </Link>
        </div>

        {/* สินค้าสต็อกต่ำ */}
        <div
          className={`rounded-2xl border p-5 shadow-xs ${
            data.lowStockProducts.length > 0
              ? "border-amber-200 bg-amber-50/50"
              : "border-line bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-900">
              สต็อกใกล้หมด
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 font-bold">
              ⚠️
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-amber-800">
            {data.lowStockProducts.length} รายการ
          </p>
          <Link
            href="/admin/inventory?low_stock=1"
            className="mt-1 inline-block text-xs font-medium text-amber-800 hover:underline"
          >
            ดูสินค้าสต็อกต่ำทั้งหมด →
          </Link>
        </div>
      </div>

      {/* กราฟสัดส่วนยอดขายตามหมวดหมู่ */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
        <h3 className="font-bold text-ink text-base mb-1">
          สถิติยอดขายตามหมวดหมู่สินค้า
        </h3>
        <p className="text-xs text-ink-soft mb-6">
          เปรียบเทียบยอดขายรวม (บาท) และจำนวนชิ้นที่จำหน่ายได้ในแต่ละกลุ่มผลิตภัณฑ์
        </p>

        <div className="space-y-4">
          {data.salesByCategory.map((cat) => {
            const pct = Math.round((cat.total_revenue / maxCategoryRevenue) * 100);
            return (
              <div key={cat.category_name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-ink font-semibold">{cat.category_name}</span>
                  <div className="flex gap-4">
                    <span className="text-ink-soft font-mono">
                      ขายได้ {cat.total_sold} ชิ้น
                    </span>
                    <span className="text-brand-deep font-bold font-mono">
                      {formatPrice(cat.total_revenue)}
                    </span>
                  </div>
                </div>
                <div className="h-3 w-full rounded-full bg-paper overflow-hidden border border-line/60">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-500"
                    style={{ width: `${Math.max(cat.total_revenue > 0 ? 5 : 0, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ตารางคู่: คำสั่งซื้อล่าสุด & สินค้าสต็อกต่ำ */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* คำสั่งซื้อล่าสุด */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
            <h3 className="font-bold text-ink text-base">คำสั่งซื้อล่าสุด</h3>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-brand hover:underline"
            >
              ดูทั้งหมด →
            </Link>
          </div>

          <div className="divide-y divide-line/60">
            {data.recentOrders.length === 0 ? (
              <p className="py-8 text-center text-xs text-ink-soft">ยังไม่มีคำสั่งซื้อ</p>
            ) : (
              data.recentOrders.map((order) => {
                const badge = STATUS_BADGES[order.status] ?? STATUS_BADGES.pending;
                return (
                  <div
                    key={order.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-bold text-brand hover:underline font-mono"
                        >
                          #{order.id}
                        </Link>
                        <span className="font-semibold text-ink truncate max-w-[120px] sm:max-w-[180px]">
                          {order.customer_name}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-soft mt-0.5">{order.created_at}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.bg} ${badge.text}`}
                      >
                        {badge.label}
                      </span>
                      <span className="font-bold font-mono text-ink">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* แจ้งเตือนสินค้าใกล้หมด */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-ink text-base">สินค้าที่ต้องเติมสต็อก</h3>
              {data.lowStockProducts.length > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.2 text-[10px] font-bold text-white">
                  {data.lowStockProducts.length}
                </span>
              )}
            </div>
            <Link
              href="/admin/inventory?low_stock=1"
              className="text-xs font-semibold text-brand hover:underline"
            >
              ดูทั้งหมด →
            </Link>
          </div>

          <div className="divide-y divide-line/60">
            {data.lowStockProducts.length === 0 ? (
              <p className="py-8 text-center text-xs text-emerald-700 font-medium">
                ✓ ไม่มีสินค้าสต็อกต่ำกว่าเกณฑ์ สต็อกสินค้าพร้อมจำหน่ายครบถ้วน
              </p>
            ) : (
              data.lowStockProducts.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-ink truncate">{product.name}</p>
                    <p className="text-[11px] text-ink-soft mt-0.5">
                      เกณฑ์เตือน: {product.low_stock_threshold} ชิ้น • หมวด {product.category_name}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        product.stock === 0
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      เหลือ {product.stock}
                    </span>
                    <Link
                      href={`/admin/inventory/${product.id}/edit`}
                      className="rounded border border-line px-2 py-0.5 text-[11px] font-semibold text-ink hover:border-brand hover:text-brand"
                    >
                      เติมของ
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
