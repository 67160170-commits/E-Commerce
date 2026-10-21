import type { Metadata } from "next";
import Link from "next/link";
import RankingSection from "@/components/RankingSection";
import { listProducts } from "@/lib/products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "อันดับความหอม" };

export default function RankingsPage() {
  return <main className="mx-auto w-full max-w-6xl px-4 py-10">
    <Link href="/" className="text-sm text-ink-soft hover:text-brand">← กลับไปเลือกยาดม</Link>
    <div className="mt-8"><RankingSection products={listProducts({ sort: "rating" })} full /></div>
  </main>;
}
