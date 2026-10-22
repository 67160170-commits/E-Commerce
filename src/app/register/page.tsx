import { safeRedirect } from "@/lib/safe-redirect";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/RegisterForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "สมัครสมาชิก",
  description: "สร้างบัญชีผู้ใช้ใหม่สำหรับสั่งซื้อสินค้าใน My YaDom",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const user = await getCurrentUser();
  const { redirect: redirectTo } = await searchParams;

  if (user) {
    redirect(safeRedirect(redirectTo));
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-ink">สมัครสมาชิก</h1>
          <p className="mt-1 text-sm text-ink-soft">สร้างบัญชีผู้ใช้เพื่อความสะดวกในการสั่งซื้อ</p>
        </div>
        <RegisterForm redirectTo={redirectTo} />
      </div>
    </main>
  );
}
