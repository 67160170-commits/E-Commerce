import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">ไม่พบหน้าที่ต้องการ</h1>
      <p className="mt-2 text-ink-soft">สินค้านี้อาจถูกนำออกแล้ว หรือลิงก์ไม่ถูกต้อง</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-brand px-5 py-2 font-medium text-white hover:bg-brand-deep"
      >
        กลับไปดูสินค้าทั้งหมด
      </Link>
    </main>
  );
}
