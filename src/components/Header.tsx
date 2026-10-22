import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { getPopulatedCart } from "@/lib/cart";
import { logoutAction } from "@/app/actions/auth";

export default async function Header() {
  const user = await getCurrentUser();
  const cart = await getPopulatedCart();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-brand-deep">
            <Image src="/brand/my-yadom-logo.png" alt="My YaDom" width={80} height={80} className="h-16 w-16 object-contain sm:h-20 sm:w-20" loading="eager" />
          </Link>
          <nav aria-label="เมนูหลัก" className="hidden items-center gap-5 text-sm text-ink-soft lg:flex">
            <Link href="/#catalog" className="hover:text-brand">รวมยาดม</Link>
            <Link href="/rankings" className="hover:text-brand">อันดับความหอม ↗</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* ปุ่มตะกร้าสินค้า */}
          <Link
            href="/cart"
            id="nav-cart-btn"
            className="relative flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-brand hover:text-brand"
            aria-label={`ตะกร้าสินค้า มีสินค้า ${cart.itemCount} ชิ้น`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="hidden sm:inline">ตะกร้า</span>
            {cart.itemCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-citrus px-1 text-xs font-bold text-white">
                {cart.itemCount}
              </span>
            )}
          </Link>

          {/* แถบผู้ใช้ / ล็อกอิน */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  id="nav-admin-btn"
                  className="rounded-lg bg-brand/10 border border-brand/30 px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-brand hover:bg-brand hover:text-white transition-colors"
                >
                  ⚙ จัดการระบบ
                </Link>
              )}
              <Link
                href="/orders"
                className="hidden rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-brand sm:inline-block"
              >
                คำสั่งซื้อ
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-1.5 rounded-lg bg-paper px-3 py-2 text-sm font-medium text-ink hover:text-brand"
              >
                <svg
                  className="h-4 w-4 text-brand"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="max-w-[100px] truncate sm:max-w-[140px]">{user.name}</span>
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-lg border border-line px-2.5 py-2 text-xs font-medium text-ink-soft hover:border-red-300 hover:text-red-600 sm:text-sm"
                  title="ออกจากระบบ"
                >
                  ออกจากระบบ
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                id="nav-login-btn"
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:text-brand"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                id="nav-register-btn"
                className="rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-deep shadow-sm"
              >
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>
      </div>
      <nav aria-label="เมนูหลักบนมือถือ" className="flex justify-center gap-8 border-t border-line px-4 py-2 text-xs text-ink-soft lg:hidden"><Link href="/#catalog">รวมยาดม</Link><Link href="/rankings">อันดับความหอม ↗</Link></nav>
    </header>
  );
}
