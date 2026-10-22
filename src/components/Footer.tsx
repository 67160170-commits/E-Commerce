import Link from "next/link";
import Image from "next/image";
import CookieSettingsTrigger from "./CookieSettingsTrigger";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between text-xs text-ink-soft">
        <div>
          <Image src="/brand/my-yadom-logo.png" alt="My YaDom" width={96} height={96} className="h-24 w-24 object-contain" />
          <p className="mt-2">โลกของยาดมไทย ที่หอมเป็นคุณ</p>
          <p className="mt-0.5">
            โปรเจกต์วิชา E-Commerce · ราคา สต็อก และคำบรรยายกลิ่นเป็นข้อมูลตัวอย่าง
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
