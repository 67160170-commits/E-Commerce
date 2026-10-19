import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAdminStats } from "@/lib/admin";

export const metadata: Metadata = {
  title: {
    default: "ระบบจัดการหลังบ้าน | VitaShop Admin",
    template: "%s | VitaShop Admin",
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  const stats = getAdminStats();

  return (
    <div className="min-h-screen bg-paper pb-16">
      {/* ส่วนหัวของแอดมิน */}
      <div className="border-b border-line bg-white shadow-xs">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-brand px-2 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
                Admin Panel
              </span>
              <h1 className="text-xl font-bold text-ink">ระบบจัดการหลังบ้าน VitaShop</h1>
            </div>
            <p className="mt-0.5 text-xs text-ink-soft">
              เข้าสู่ระบบโดย: <span className="font-semibold text-ink">{admin.name}</span> ({admin.email})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand hover:text-brand"
            >
              <span>← ดูหน้าร้าน</span>
            </Link>
          </div>
        </div>

        {/* แถบเมนูนำทางหลักใน Admin */}
        <div className="mx-auto flex w-full max-w-6xl gap-2 px-4 overflow-x-auto text-sm">
          <Link
            href="/admin/inventory"
            className="flex items-center gap-2 border-b-2 border-brand px-3 py-3 font-semibold text-brand"
          >
            <span>📦 สินค้าและสต็อก</span>
            {stats.lowStockCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-white" title={`${stats.lowStockCount} สินค้าสต็อกต่ำกว่าเกณฑ์`}>
                {stats.lowStockCount}
              </span>
            )}
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 border-b-2 border-transparent px-3 py-3 font-medium text-ink-soft hover:border-line hover:text-ink"
          >
            <span>📋 คำสั่งซื้อทั้งหมด</span>
            {stats.pendingOrders > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white" title={`${stats.pendingOrders} ออเดอร์รอดำเนินการ`}>
                {stats.pendingOrders}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pt-6">{children}</div>
    </div>
  );
}
