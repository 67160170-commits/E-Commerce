import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ProductImage from "@/components/ProductImage";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { getOrderById, type OrderStatus } from "@/lib/orders";

export const dynamic = "force-dynamic";

const STATUS_MAP: Record<
  OrderStatus,
  { label: string; bg: string; text: string }
> = {
  pending: { label: "รอดำเนินการ", bg: "bg-amber-100", text: "text-amber-800" },
  paid: { label: "ชำระเงินแล้ว", bg: "bg-blue-100", text: "text-blue-800" },
  shipped: { label: "กำลังจัดส่ง", bg: "bg-purple-100", text: "text-purple-800" },
  delivered: { label: "จัดส่งสำเร็จ", bg: "bg-emerald-100", text: "text-emerald-800" },
  cancelled: { label: "ยกเลิกแล้ว", bg: "bg-red-100", text: "text-red-800" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `คำสั่งซื้อ #${id}` };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id: rawId } = await params;
  const orderId = Number(rawId);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    notFound();
  }

  const orderData = getOrderById(orderId, user.role === "admin" ? undefined : user.id);
  if (!orderData) {
    notFound();
  }

  const { order, items } = orderData;
  const statusInfo = STATUS_MAP[order.status] ?? STATUS_MAP.pending;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      {/* ส่วนหัวแสดงผลสำเร็จและสถานะ */}
      <div className="rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                ✓
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-ink">
                คำสั่งซื้อ #{order.id}
              </h1>
            </div>
            <p className="mt-1 text-xs text-ink-soft sm:text-sm">
              สั่งซื้อเมื่อ: {order.created_at}
            </p>
          </div>

          <span
            className={`inline-flex items-center self-start rounded-full px-3.5 py-1 text-sm font-semibold sm:self-auto ${statusInfo.bg} ${statusInfo.text}`}
          >
            {statusInfo.label}
          </span>
        </div>

        {/* ข้อมูลการจัดส่งและการชำระเงิน */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-line/70 bg-paper/50 p-4">
            <h2 className="text-sm font-semibold text-ink">ที่อยู่สำหรับจัดส่ง</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft whitespace-pre-line">
              {order.shipping_address}
            </p>
            {order.tracking_number && (
              <p className="mt-3 text-xs font-medium text-brand">
                เลขพัสดุ: <span className="font-mono">{order.tracking_number}</span>
              </p>
            )}
          </div>

          <div className="rounded-xl border border-line/70 bg-paper/50 p-4">
            <h2 className="text-sm font-semibold text-ink">วิธีการชำระเงิน</h2>
            <p className="mt-2 text-sm text-ink-soft">
              {order.payment_method === "cod"
                ? "ชำระเงินปลายทาง (COD)"
                : "โอนเงินผ่านบัญชีธนาคาร (Bank Transfer)"}
            </p>

            {order.payment_method === "bank_transfer" && (
              <div className="mt-3 rounded-lg border border-line bg-white p-3 text-xs text-ink-soft space-y-1">
                <p className="font-medium text-ink">ข้อมูลการโอนเงิน:</p>
                <p>ธนาคารกสิกรไทย: <span className="font-mono font-semibold text-brand">123-4-56789-0</span></p>
                <p>ชื่อบัญชี: บจก. ไวต้าช็อป (ประเทศไทย)</p>
                <p className="text-[11px] text-amber-700">
                  * เมื่อโอนเงินแล้ว ระบบจะตรวจสอบยอดเงินและปรับสถานะให้ภายใน 24 ชม.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* รายการสินค้าในออเดอร์ */}
        <div className="mt-8">
          <h2 className="text-base font-bold text-ink mb-4">รายการสินค้า</h2>
          <div className="divide-y divide-line rounded-xl border border-line overflow-hidden bg-white">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 text-sm">
                <ProductImage
                  categoryId={item.category_id}
                  imageUrl={item.image_url}
                  alt={item.product_name}
                  className="h-16 w-16 shrink-0 rounded-lg border border-line object-cover"
                />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product_id}`}
                    className="font-medium text-ink hover:text-brand truncate block"
                  >
                    {item.product_name}
                  </Link>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {formatPrice(item.unit_price)} × {item.quantity} ชิ้น
                  </p>
                </div>
                <div className="text-right font-bold text-ink">
                  {formatPrice(item.unit_price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col items-end gap-1.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between w-48 text-ink-soft">
              <span>ค่าจัดส่ง:</span>
              <span className="text-emerald-700 font-medium">ส่งฟรี</span>
            </div>
            <div className="flex justify-between w-48 text-base font-bold text-ink">
              <span>ยอดรวมทั้งหมด:</span>
              <span className="text-xl text-brand-deep">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* ปุ่มนำทาง */}
        <div className="mt-8 flex flex-wrap gap-4 border-t border-line pt-6">
          <Link
            href="/orders"
            className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
          >
            ← ดูประวัติคำสั่งซื้อทั้งหมด
          </Link>
          <Link
            href="/"
            className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-deep"
          >
            เลือกซื้อสินค้าต่อ
          </Link>
        </div>
      </div>
    </main>
  );
}
