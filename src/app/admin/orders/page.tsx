import type { Metadata } from "next";
import Link from "next/link";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";
import { listAdminOrders } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "จัดการคำสั่งซื้อ (Orders)",
};

const STATUS_TABS: { key: string; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pending", label: "รอดำเนินการ" },
  { key: "paid", label: "ชำระเงินแล้ว" },
  { key: "shipped", label: "กำลังจัดส่ง" },
  { key: "delivered", label: "จัดส่งสำเร็จ" },
  { key: "cancelled", label: "ยกเลิกแล้ว" },
];

const STATUS_BADGES: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending: { label: "รอดำเนินการ", bg: "bg-amber-100", text: "text-amber-800" },
  paid: { label: "ชำระแล้ว", bg: "bg-blue-100", text: "text-blue-800" },
  shipped: { label: "กำลังจัดส่ง", bg: "bg-purple-100", text: "text-purple-800" },
  delivered: { label: "สำเร็จ", bg: "bg-emerald-100", text: "text-emerald-800" },
  cancelled: { label: "ยกเลิก", bg: "bg-red-100", text: "text-red-800" },
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const { status = "all", search } = await searchParams;

  const orders = listAdminOrders({
    status: status !== "all" ? status : undefined,
    search,
  });

  const allOrders = listAdminOrders();
  const countsByStatus: Record<string, number> = {
    all: allOrders.length,
    pending: allOrders.filter((o) => o.status === "pending").length,
    paid: allOrders.filter((o) => o.status === "paid").length,
    shipped: allOrders.filter((o) => o.status === "shipped").length,
    delivered: allOrders.filter((o) => o.status === "delivered").length,
    cancelled: allOrders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div className="space-y-6">
      {/* แท็บสถานะคำสั่งซื้อ */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-2">
        {STATUS_TABS.map((tab) => {
          const isActive = status === tab.key;
          const count = countsByStatus[tab.key] ?? 0;
          return (
            <Link
              key={tab.key}
              href={`/admin/orders?status=${tab.key}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-brand text-white shadow-xs"
                  : "bg-white text-ink-soft hover:bg-paper hover:text-ink border border-line"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-paper text-ink-soft"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* ช่องค้นหาคำสั่งซื้อ */}
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <form className="flex flex-wrap items-center gap-2 text-sm w-full sm:w-auto">
          <input type="hidden" name="status" value={status} />
          <input
            type="search"
            name="search"
            defaultValue={search ?? ""}
            placeholder="ค้นหาเลขที่ออเดอร์, ชื่อลูกค้า, อีเมล..."
            className="w-full sm:w-80 rounded-xl border border-line bg-paper px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-white hover:bg-brand transition-colors"
          >
            ค้นหา
          </button>
          {search && (
            <Link
              href={`/admin/orders?status=${status}`}
              className="text-xs font-medium text-ink-soft hover:text-red-600 underline"
            >
              ล้างการค้นหา
            </Link>
          )}
        </form>

        <span className="text-xs text-ink-soft">
          พบคำสั่งซื้อทั้งหมด <b>{orders.length}</b> รายการ
        </span>
      </div>

      {/* ตารางคำสั่งซื้อ */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-ink">
            <thead className="border-b border-line bg-paper/60 text-xs font-bold uppercase text-ink-soft">
              <tr>
                <th scope="col" className="px-4 py-3.5">
                  เลขที่ออเดอร์
                </th>
                <th scope="col" className="px-4 py-3.5">
                  ลูกค้า
                </th>
                <th scope="col" className="px-4 py-3.5">
                  ยอดรวม
                </th>
                <th scope="col" className="px-4 py-3.5">
                  ชำระเงิน
                </th>
                <th scope="col" className="px-4 py-3.5">
                  สถานะคำสั่งซื้อ
                </th>
                <th scope="col" className="px-4 py-3.5">
                  เลขพัสดุ
                </th>
                <th scope="col" className="px-4 py-3.5 text-right">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-ink-soft">
                    ไม่พบรายการคำสั่งซื้อตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const badge = STATUS_BADGES[o.status] ?? STATUS_BADGES.pending;
                  return (
                    <tr key={o.id} className="hover:bg-paper/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-bold text-brand hover:underline font-mono"
                        >
                          #{o.id}
                        </Link>
                        <p className="text-[11px] text-ink-soft mt-0.5">{o.created_at}</p>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-ink line-clamp-1">{o.customer_name}</p>
                        <p className="text-xs text-ink-soft">{o.customer_email}</p>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="font-bold font-mono text-ink">{formatPrice(o.total)}</p>
                        <p className="text-[11px] text-ink-soft">({o.item_count} รายการ)</p>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-ink-soft">
                        {o.payment_method === "cod" ? "เก็บเงินปลายทาง" : "โอนเงินธนาคาร"}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1.5">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold w-fit ${badge.bg} ${badge.text}`}
                          >
                            {badge.label}
                          </span>
                          <OrderStatusUpdater
                            orderId={o.id}
                            currentStatus={o.status}
                            currentTrackingNumber={o.tracking_number}
                            compact={true}
                          />
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs font-mono text-ink-soft">
                        {o.tracking_number ? (
                          <span className="font-semibold text-ink">{o.tracking_number}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="rounded-lg border border-line px-3 py-1 text-xs font-semibold text-ink hover:border-brand hover:text-brand"
                        >
                          ดูรายละเอียด
                        </Link>
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
