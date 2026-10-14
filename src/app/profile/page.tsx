import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AddressManager from "@/components/AddressManager";
import { getCurrentUser } from "@/lib/auth";
import { getUserAddresses } from "@/lib/addresses";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "โปรไฟล์และที่อยู่จัดส่ง",
  description: "จัดการข้อมูลส่วนตัวและที่อยู่สำหรับจัดส่งสินค้าของคุณ",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/profile");
  }

  const addresses = getUserAddresses(user.id);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="border-b border-line pb-4 mb-6">
        <h1 className="text-2xl font-bold text-ink">โปรไฟล์และข้อมูลผู้ใช้</h1>
        <p className="mt-1 text-sm text-ink-soft">
          จัดการข้อมูลบัญชีและสมุดที่อยู่จัดส่งสินค้า
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* คอลัมน์ซ้าย: ข้อมูลบัญชี */}
        <div className="md:col-span-1">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand font-bold text-xl mb-4">
              {user.name.charAt(0)}
            </div>

            <h2 className="text-lg font-bold text-ink">{user.name}</h2>
            <p className="text-sm text-ink-soft mt-0.5">{user.email}</p>

            <div className="mt-4 border-t border-line pt-4 space-y-2 text-xs text-ink-soft">
              <div className="flex justify-between">
                <span>ประเภทบัญชี:</span>
                <span className="font-semibold text-brand uppercase">
                  {user.role === "admin" ? "ผู้ดูแลระบบ" : "ลูกค้าทั่วไป"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>วันที่สมัครสมาชิก:</span>
                <span>{user.created_at}</span>
              </div>
            </div>
          </div>
        </div>

        {/* คอลัมน์ขวา: สมุดที่อยู่ */}
        <div className="md:col-span-2">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-ink mb-1">สมุดที่อยู่จัดส่ง</h2>
            <p className="text-xs text-ink-soft mb-4">
              บันทึกที่อยู่จัดส่งล่วงหน้า เพื่อความสะดวกรวดเร็วเมื่อสั่งซื้อสินค้า
            </p>

            <AddressManager addresses={addresses} defaultRecipientName={user.name} />
          </div>
        </div>
      </div>
    </main>
  );
}
