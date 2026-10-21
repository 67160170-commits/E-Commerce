import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { getUserOrders, type OrderStatus } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ประวัติคำสั่งซื้อ",
  description: "รายการคำสั่งซื้อยาดมทั้งหมดของคุณ",
};

const STATUS_MAP: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending: { label: "รอดำเนินการ", bg: "bg-amber-100", text: "text-amber-800" },
  paid: { label: "ชำระเงินแล้ว", bg: "bg-blue-100", text: "text-blue-800" },
  shipped: { label: "กำลังจัดส่ง", bg: "bg-purple-100", text: "text-purple-800" },
  delivered: { label: "จัดส่งสำเร็จ", bg: "bg-emerald-100", text: "text-emerald-800" },
  cancelled: { label: "ยกเลิกแล้ว", bg: "bg-red-100", text: "text-red-800" },
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/orders");
  }

  const orders = getUserOrders(user.id);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="border-b border-line pb-4 mb-6">
        <h1 className="text-2xl font-bold text-ink">ประวัติคำสั่งซื้อ</h1>
        <p className="mt-1 text-sm text-ink-soft">
          ตรวจสอบสถานะและรายละเอียดคำสั่งซื้อของคุณทั้งหมด
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="my-16 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-paper border border-line text-ink-soft">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-bold text-ink">ยังไม่มีประวัติคำสั่งซื้อ</h2>
          <p className="mt-1 text-sm text-ink-soft max-w-sm">
            คุณยังไม่มีรายการสั่งซื้อใด ๆ เมื่อสั่งซื้อสินค้าแล้วจะปรากฏที่นี่
          </p>
          <Link
            href="/"
            className="mt-6 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-deep"
          >
            เลือกซื้อสินค้า
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
            return (
              <div
                key={order.id}
                className="flex flex-col gap-4 rounded-xl border border-line bg-white p-5 shadow-sm transition-all hover:border-brand/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-ink">ออเดอร์ #{order.id}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-soft">
                    สั่งซื้อวันที่: {order.created_at} • ชำระโดย:{" "}
                    {order.payment_method === "cod" ? "เก็บเงินปลายทาง" : "โอนเงิน"}
                  </p>
                  {order.tracking_number && (
                    <p className="mt-1 text-xs text-brand font-mono">
                      เลขพัสดุ: {order.tracking_number}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-6 border-t border-line/60 pt-3 sm:border-t-0 sm:pt-0">
                  <div className="text-right">
                    <span className="text-xs text-ink-soft">ยอดรวม</span>
                    <p className="text-lg font-bold text-brand-deep">
                      {formatPrice(order.total)}
                    </p>
                  </div>

                  <Link
                    href={`/orders/${order.id}`}
                    className="rounded-lg border border-line px-3.5 py-2 text-xs font-semibold text-ink hover:border-brand hover:text-brand"
                  >
                    ดูรายละเอียด
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
