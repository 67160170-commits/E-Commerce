import Link from "next/link";
import ProductImage from "./ProductImage";
import type { Product } from "@/lib/products";

export default function RankingSection({ products, full = false }: { products: Product[]; full?: boolean }) {
  const Heading = full ? "h1" : "h2";
  const ranked = products.filter((p) => p.review_count > 0);
  const visible = full ? ranked : ranked.slice(0, 3);
  return (
    <section id="rankings" className="ranking-section scroll-mt-36">
      <div className="section-heading">
        <div><p className="eyebrow">THE SCENT CHART</p><Heading className="mt-2 text-3xl font-semibold">ยาดมไหน… หอมที่สุด?</Heading></div>
        {!full && <Link className="text-link" href="/rankings">ดูอันดับทั้งหมด <span aria-hidden>↗</span></Link>}
      </div>
      <p className="mb-6 max-w-2xl text-sm leading-7 text-ink-soft">อันดับจากคะแนนความหอมของสมาชิก My YaDom เต็ม 5 คะแนน ความหอมเป็นความชอบส่วนบุคคล มาร่วมโหวตให้กลิ่นโปรดของคุณ</p>
      {visible.length ? (
        <ol className={full ? "grid gap-4" : "grid gap-4 md:grid-cols-3"}>
          {visible.map((p, index) => <li key={p.id}>
            <Link href={`/products/${p.id}#reviews`} className="ranking-card">
              <span className="rank-number">{String(index + 1).padStart(2, "0")}</span>
              <ProductImage categoryId={p.category_id} imageUrl={p.image_url} alt="" className="h-24 w-24 rounded-xl" />
              <div className="min-w-0"><p className="text-xs text-ink-soft">{p.category_name}</p><h3 className="mt-1 text-sm font-semibold">{p.name}</h3><p className="mt-2 text-sm"><span className="font-bold text-brand">★ {p.average_rating?.toFixed(2)}</span><span className="ml-2 text-xs text-ink-soft">{p.review_count} คะแนน</span></p></div>
            </Link>
          </li>)}
        </ol>
      ) : (
        <div className="ranking-empty"><span className="text-4xl text-brand" aria-hidden>☆</span><div><h3 className="font-semibold">อันดับแรก อาจเริ่มจากกลิ่นโปรดของคุณ</h3><p className="mt-1 text-sm leading-7 text-ink-soft">ยังไม่มีคะแนน เลือกยาดมที่เคยลองแล้วให้คะแนนเพื่อเริ่มจัดอันดับจริง</p></div><Link href="/#catalog" className="rounded-full border border-brand px-5 py-3 text-sm font-semibold text-brand">เลือกกลิ่นแล้วให้คะแนน ↗</Link></div>
      )}
      {full && <p className="mt-5 text-xs leading-6 text-ink-soft">วิธีจัดอันดับ: ค่าเฉลี่ยคะแนนมากที่สุดก่อน หากเท่ากันใช้จำนวนผู้ให้คะแนนมากที่สุด แล้วใช้รหัสสินค้าเรียงจากน้อยไปมาก สินค้าที่ยังไม่มีคะแนนยังไม่เข้าร่วมอันดับ รีวิวเป็นความคิดเห็นจากสมาชิกทั่วไป ไม่ได้ยืนยันการซื้อ</p>}
    </section>
  );
}
