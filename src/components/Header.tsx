import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-brand-deep">
          <span aria-hidden className="inline-block h-5 w-5 rounded-full bg-citrus" />
          VitaShop
        </Link>
        <span className="hidden text-sm text-ink-soft sm:inline">วิตามินและอาหารเสริม</span>
      </div>
    </header>
  );
}
