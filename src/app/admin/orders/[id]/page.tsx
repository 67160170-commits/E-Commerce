import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductImage from "@/components/ProductImage";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";
import { getAdminOrder } from "@/lib/admin";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `รายละเอียดคำสั่งซื้อ #${id} (Admin)` };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const orderId = Number(rawId);
  if (!Number.isInteger(orderId) || orderId <= 0) notFound();

  const data = getAdminOrder(orderId);
  if (!data) notFound();

  const { order, items } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-brand hover:underline"
            >
              ← กลับไปรายการคำสั่งซื้อ
            </Link>
            <span className="text-line">•</span>
            <span className="text-xs text-ink-soft">คำสั่งซื้อ #{order.id}</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-ink">
            คำสั่งซื้อ #{order.id}
          </h2>
          <p className="text-xs text-ink-soft">
            สั่งซื้อเมื่อ: {order.created_at}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ข้อมูล 2 คอลัมน์ซ้าย: จัดการสถานะ + รายการสินค้า */}
        <div className="space-y-6 lg:col-span-2">
          {/* การ์ดเปลี่ยนสถานะและใส่ Tracking Number */}
          <OrderStatusUpdater
            orderId={order.id}
            currentStatus={order.status}
                              paymentMethod={order.payment_method}
            currentTrackingNumber={order.tracking_number}
          />

          {/* รายการสินค้าในออเดอร์ */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <h3 className="font-bold text-ink text-base mb-4">
              รายการสินค้าที่สั่งซื้อ ({items.length} รายการ)
            </h3>

            <div className="divide-y divide-line rounded-xl border border-line overflow-hidden bg-white">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 text-sm">
                  <ProductImage
                    categoryId={item.category_id}
                    imageUrl={item.image_url}
                    alt={item.product_name}
                    className="h-14 w-14 shrink-0 rounded-lg border border-line object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink truncate">{item.product_name}</p>
                    <p className="text-xs text-ink-soft mt-0.5">
                      {formatPrice(item.unit_price)} × {item.quantity} ชิ้น
                    </p>
                  </div>
                  <div className="text-right font-bold font-mono text-ink">
                    {formatPrice(item.unit_price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col items-end gap-1.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between w-56 text-ink-soft">
                <span>ค่าจัดส่ง:</span>
                <span className="text-emerald-700 font-medium">ส่งฟรี</span>
              </div>
              <div className="flex justify-between w-56 text-base font-bold text-ink">
                <span>ยอดรวมสุทธิ:</span>
                <span className="text-xl text-brand-deep font-mono">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 1 คอลัมน์ขวา: ข้อมูลลูกค้าและที่อยู่จัดส่ง */}
        <div className="space-y-6 lg:col-span-1">
          {/* ข้อมูลลูกค้า */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
            <h3 className="font-bold text-ink text-sm border-b border-line pb-3 mb-3">
              ข้อมูลลูกค้า
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-ink-soft block">ชื่อลูกค้า:</span>
                <span className="font-semibold text-ink text-sm">{order.customer_name}</span>
              </div>
              <div>
                <span className="text-ink-soft block">อีเมล:</span>
                <span className="font-medium text-ink">{order.customer_email}</span>
              </div>
              <div>
                <span className="text-ink-soft block">รหัสผู้ใช้:</span>
                <span className="font-mono text-ink-soft">User ID #{order.user_id}</span>
              </div>
            </div>
          </div>

          {/* ข้อมูลการจัดส่งและชำระเงิน */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
            <h3 className="font-bold text-ink text-sm border-b border-line pb-3 mb-3">
              ข้อมูลจัดส่งและชำระเงิน
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-ink-soft block">วิธีการชำระเงิน:</span>
                <span className="font-semibold text-ink">
                  {order.payment_method === "cod"
                    ? "ชำระเงินปลายทาง (Cash on Delivery)"
                    : "โอนเงินผ่านธนาคาร (Bank Transfer)"}
                </span>
              </div>
              <div>
                <span className="text-ink-soft block">ที่อยู่จัดส่งสินค้า:</span>
                <p className="mt-1 font-medium text-ink leading-relaxed whitespace-pre-line bg-paper p-3 rounded-lg border border-line/60">
                  {order.shipping_address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
