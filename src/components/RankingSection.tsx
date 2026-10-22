import Link from "next/link";
import ProductImage from "./ProductImage";
import { rankProducts, LOW_REVIEW_THRESHOLD } from "@/lib/ranking";
import type { Product } from "@/lib/products";

export default function RankingSection({ products, full = false }: { products: Product[]; full?: boolean }) {
  const Heading = full ? "h1" : "h2";
  const ranked = rankProducts(products);
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
              <div className="min-w-0"><p className="text-xs text-ink-soft">{p.category_name}</p><h3 className="mt-1 text-sm font-semibold">{p.name}</h3><p className="mt-2 text-sm"><span className="font-bold text-brand">★ {p.average_rating?.toFixed(2)}</span><span className="ml-2 text-xs text-ink-soft">{p.review_count} คะแนน</span></p>{p.review_count < LOW_REVIEW_THRESHOLD && <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800">คะแนนยังน้อย</span>}</div>
            </Link>
          </li>)}
        </ol>
      ) : (
        <div className="ranking-empty"><span className="text-4xl text-brand" aria-hidden>☆</span><div><h3 className="font-semibold">มาร่วมสร้างอันดับจากหลายความคิดเห็น</h3><p className="mt-1 text-sm leading-7 text-ink-soft">สินค้าที่มีคะแนนตั้งแต่ 1 คนขึ้นไปสามารถเข้าอันดับได้ เลือกยาดมที่เคยลองแล้วร่วมให้คะแนนได้เลย</p></div><Link href="/#catalog" className="rounded-full border border-brand px-5 py-3 text-sm font-semibold text-brand">เลือกกลิ่นแล้วให้คะแนน ↗</Link></div>
      )}
      {products.some(p => p.review_count === 0) && <div className="mt-5"><h3 className="text-sm font-semibold">กลิ่นที่ยังไม่มีคะแนน</h3><div className="mt-3 flex flex-wrap gap-2">{products.filter(p => p.review_count === 0).slice(0, full ? 12 : 3).map(p => <Link key={p.id} href={`/products/${p.id}#reviews`} className="rounded-full border border-line bg-white px-4 py-2 text-xs text-ink-soft">{p.name} · ยังไม่มีคะแนน ↗</Link>)}</div></div>}
      {full && <p className="mt-5 text-xs leading-6 text-ink-soft">วิธีจัดอันดับ: ค่าเฉลี่ยคะแนนมากที่สุดก่อน หากเท่ากันใช้จำนวนผู้ให้คะแนนมากที่สุด แล้วใช้รหัสสินค้าเรียงจากน้อยไปมาก สินค้าที่มีคะแนนตั้งแต่ 1 คนขึ้นไปเข้าอันดับได้ หากมีผู้ให้คะแนนน้อยกว่า 3 คนจะแสดงป้าย “คะแนนยังน้อย” รีวิวเป็นความคิดเห็นจากสมาชิกทั่วไป ไม่ได้ยืนยันการซื้อ</p>}
    </section>
  );
}
