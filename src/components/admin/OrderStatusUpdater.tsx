"use client";

import { useState, useTransition } from "react";
import type { OrderStatus } from "@/lib/orders";
import { nextOrderStatuses } from "@/lib/commerce";
import { updateOrderStatusAction } from "@/app/actions/admin";

const STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "รอดำเนินการ (Pending)" },
  { value: "paid", label: "ชำระเงินแล้ว (Paid)" },
  { value: "shipped", label: "กำลังจัดส่ง (Shipped)" },
  { value: "delivered", label: "จัดส่งสำเร็จ (Delivered)" },
  { value: "cancelled", label: "ยกเลิกออเดอร์ (Cancelled)" },
];

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
  currentTrackingNumber,
  paymentMethod,
  compact = false,
}: {
  orderId: number;
  currentStatus: OrderStatus;
  currentTrackingNumber: string | null;
  paymentMethod?: "cod" | "bank_transfer";
  compact?: boolean;
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState<string>(
    currentTrackingNumber ?? ""
  );
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");

  const available = STATUSES.filter((option) => nextOrderStatuses(currentStatus).includes(option.value) && !(paymentMethod === "bank_transfer" && currentStatus === "pending" && option.value === "shipped"));

  const handleUpdate = (newStatus: OrderStatus, newTracking: string) => {
    setStatus(newStatus);
    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, newStatus, newTracking);
      if (res.success) {
        setMessage("บันทึกสำเร็จ ✓");
        setTimeout(() => setMessage(""), 2500);
      } else {
        setStatus(currentStatus);
        setMessage(res.error || "เกิดข้อผิดพลาด");
      }
    });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <select
          value={status}
          disabled={isPending}
          onChange={(e) => handleUpdate(e.target.value as OrderStatus, trackingNumber)}
          className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-medium text-ink focus:border-brand focus:outline-none"
        >
          {available.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {isPending && <span className="text-[10px] text-ink-soft">...</span>}
        {message && <span role="status" className="text-xs text-ink-soft">{message}</span>}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-paper/50 p-4 space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <label className="text-sm font-bold text-ink">เปลี่ยนสถานะคำสั่งซื้อ</label>
        {message && (
          <span className="text-xs font-semibold text-emerald-700">{message}</span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1">
            สถานะคำสั่งซื้อ
          </label>
          <select
            value={status}
            disabled={isPending}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium text-ink focus:border-brand focus:outline-none"
          >
            {available.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1">
            เลขพัสดุสำหรับติดตามการจัดส่ง (Tracking Number)
          </label>
          <input
            type="text"
            value={trackingNumber}
            disabled={isPending}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="เช่น TH1234567890"
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm font-mono focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={isPending}
        onClick={() => handleUpdate(status, trackingNumber)}
        className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-deep disabled:opacity-50"
      >
        {isPending ? "กำลังบันทึก..." : "อัปเดตสถานะและเลขพัสดุ"}
      </button>
    </div>
  );
}
