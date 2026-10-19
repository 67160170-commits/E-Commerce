import Link from "next/link";
import CookieSettingsTrigger from "./CookieSettingsTrigger";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between text-xs text-ink-soft">
        <div>
          <p className="font-semibold text-ink">VitaShop — วิตามินและอาหารเสริมเพื่อสุขภาพ</p>
          <p className="mt-0.5">
            โปรเจกต์วิชา E-Commerce เพื่อการศึกษา ข้อมูลสินค้าและคำอธิบายเป็นข้อมูลสมมติ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <Link
            href="/cookie-policy"
            className="hover:text-brand transition-colors"
          >
            นโยบายการใช้คุกกี้ (PDPA)
          </Link>
          <CookieSettingsTrigger />
        </div>
      </div>
    </footer>
  );
}
