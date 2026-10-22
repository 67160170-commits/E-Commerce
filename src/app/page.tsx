import Link from "next/link";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import RankingSection from "@/components/RankingSection";
import { SORT_OPTIONS, catalogHref, isSortKey, type SortKey } from "@/lib/catalog-url";
import { listBrands, listCategories, listProducts } from "@/lib/products";

export const dynamic = "force-dynamic";
const firstValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function CatalogPage(props: PageProps<"/">) {
  const params = await props.searchParams;
  const q = (firstValue(params.q) ?? "").trim().slice(0, 100);
  const categoryId = Number(firstValue(params.category)) || undefined;
  const sortParam = firstValue(params.sort);
  const sort: SortKey = isSortKey(sortParam) ? sortParam : "recommended";
  const brands = listBrands();
  const brandParam = (firstValue(params.brand) ?? "").trim();
  const brand = brands.includes(brandParam) ? brandParam : undefined;
  const categories = listCategories();
  const activeCategory = categories.find((c) => c.id === categoryId);
  const products = listProducts({ q, brand, categoryId: activeCategory?.id, sort });
  const allProducts = listProducts({ sort: "rating" });
  const filtered = Boolean(q || brand || activeCategory || sort !== "recommended");
  const CatalogHeading = filtered ? "h1" : "h2";

  return (
    <main>
      {!filtered && <>
        <section className="hero-shell">
          <div className="hero-copy">
            <p className="eyebrow"><span className="inline-block h-2 w-2 rounded-full bg-brand" /> A LITTLE INHALE. A BETTER DAY.</p>
            <h1>โลกของยาดมไทย<br />ที่หอม…<span>เป็นคุณ</span><span className="hero-spark" aria-hidden>✳</span></h1>
            <p className="hero-description">กลิ่นคุ้นเคย หรือกลิ่นใหม่ที่อยากลอง<br />ค้นพบยาดมไทย ร่วมจัดอันดับความหอม<br className="sm:hidden" /> แล้วพกกลิ่นโปรดไปด้วยกัน</p>

          <div className="mt-7 flex flex-wrap items-center gap-5"><Link href="#catalog" className="primary-pill">ค้นหายาดมที่ใช่ <span aria-hidden>↗</span></Link><Link href="/rankings" className="text-link">ดูอันดับความหอม →</Link></div>
            <div className="hero-note"><span className="text-xl" aria-hidden>✿</span><p>ยาดมเล็ก ๆ ความชอบที่ไม่เหมือนใคร<br /><span>ค้นพบ · ให้คะแนน · ช้อป ในที่เดียว</span></p></div>
          </div>
          <div className="hero-art" aria-label="ภาพยาดมจริงหลากสไตล์">
            <span className="art-orbit" /><span className="art-spark" aria-hidden>✳</span>
            <span className="art-tag">THAI LITTLE ESSENTIALS</span>
            <div className="art-bottle art-bottle-left"><ProductImage categoryId={1} imageUrl="/products/photos/peppermint-original.jpg" alt="ยาดมเป๊ปเปอร์มิ้นท์ ฟิลด์" className="h-full w-full" /></div>
            <div className="art-bottle art-bottle-center"><ProductImage categoryId={1} imageUrl="/products/photos/hongthai-formula-2.jpg" alt="ยาดมสมุนไพรหงส์ไทย สูตร 2" className="h-full w-full" /></div>
            <div className="art-bottle art-bottle-right"><ProductImage categoryId={1} imageUrl="/products/photos/peppermint-orange.jpg" alt="ยาดมเป๊ปเปอร์มิ้นท์ ฟิลด์ กลิ่นส้ม" className="h-full w-full" /></div>
            <span className="art-sticker">small jar,<br /><strong>big freshness.</strong></span>
            <span className="art-caption">ภาพสินค้าจากแบรนด์และร้านค้า · ดูเครดิตในรายละเอียดสินค้า</span>
          </div>
        </section>
        <div className="brand-strip"><span>YOUR EVERYDAY FRESHNESS</span>{brands.map(item => <span key={item}>{item}</span>)}<span className="text-brand" aria-hidden>✳</span></div>
      </>}
      <div className="mx-auto w-full max-w-6xl px-4">
        {!filtered && <RankingSection products={allProducts} />}
        <section id="catalog" className="catalog-section scroll-mt-36">
          <div className="section-heading"><div><p className="eyebrow">FIND YOUR EVERYDAY SCENT</p><CatalogHeading className="mt-2 text-3xl font-semibold">{filtered ? "ค้นหากลิ่นที่คุณชอบ" : "กลิ่นไหนที่เป็นคุณ?"}</CatalogHeading></div><p className="text-sm text-ink-soft">ยาดมไทย {allProducts.length} รายการ และกำลังเพิ่มอีกเรื่อย ๆ</p></div>
          <form action="/#catalog" method="get" role="search" className="catalog-search">
            <span className="pl-2 text-xl text-brand" aria-hidden>⌕</span>
            <input type="search" name="q" defaultValue={q} maxLength={100} placeholder="ค้นหาชื่อยาดม แบรนด์ หรือกลิ่นที่ชอบ…" aria-label="ค้นหายาดม" className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm" />
            {activeCategory && <input type="hidden" name="category" value={activeCategory.id} />}
            {brand && <input type="hidden" name="brand" value={brand} />}
            {sort !== "recommended" && <input type="hidden" name="sort" value={sort} />}
            <button className="rounded-full bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-deep">ค้นหา</button>
          </form>
          <div className="mt-5"><CategoryFilter categories={categories} activeId={activeCategory?.id} q={q} sort={sort} brand={brand} /></div>
          <nav aria-label="เลือกแบรนด์" className="mt-4 flex flex-wrap items-center gap-2 text-xs"><span className="mr-1 text-ink-soft">แบรนด์</span>{["", ...brands].map(item => <Link key={item} href={`${catalogHref({ q, category: activeCategory?.id, sort, brand: item || undefined })}#catalog`} aria-current={(brand ?? "") === item ? "true" : undefined} className={`rounded-full border px-3 py-2 ${(brand ?? "") === item ? "border-brand bg-brand text-white" : "border-line bg-white text-ink-soft"}`}>{item || "ทุกแบรนด์"}</Link>)}</nav>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5 text-xs">
            <p aria-live="polite">พบ <strong>{products.length}</strong> รายการ {q && <>สำหรับ “{q}” </>}{activeCategory && <>ในหมวด {activeCategory.name} </>}{filtered && <Link href="/#catalog" className="ml-2 text-brand underline">ล้างตัวกรอง</Link>}</p>
            <nav aria-label="เรียงลำดับสินค้า" className="flex flex-wrap items-center gap-3"><span className="text-ink-soft">เรียงตาม</span>{SORT_OPTIONS.map((option) => <Link key={option.key} href={`${catalogHref({ q, brand, category: activeCategory?.id, sort: option.key })}#catalog`} aria-current={sort === option.key ? "true" : undefined} className={sort === option.key ? "font-semibold text-brand underline underline-offset-4" : "text-ink-soft hover:text-brand"}>{option.label}</Link>)}</nav>
          </div>
          {products.length ? <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</ul> : <div className="my-6 rounded-2xl border border-dashed border-line p-12 text-center"><h3 className="font-semibold">ยังไม่พบกลิ่นที่ค้นหา</h3><p className="mt-2 text-sm text-ink-soft">ลองใช้ชื่อแบรนด์ หรือเลือกหมวดหมู่อื่น</p><Link href="/#catalog" className="mt-5 inline-block text-sm text-brand underline">ดูยาดมทั้งหมด</Link></div>}
          <p className="mt-5 text-xs leading-6 text-ink-soft">ราคา สต็อก และคำบรรยายกลิ่นเป็นข้อมูลตัวอย่างสำหรับการศึกษา ภาพสินค้าจริงจากแบรนด์และร้านค้า</p>
        </section>
        {!filtered && <><section className="community-banner"><span className="community-flower" aria-hidden>✳</span><div><p className="eyebrow">A SCENT OF COMMUNITY</p><h2>ความหอม ไม่มีคำตอบเดียว</h2><p className="mt-3 text-sm leading-7">ชอบกลิ่นไหน บอกต่อกลิ่นนั้น<br />ให้คะแนนยาดมที่เคยลอง แล้วช่วยเพื่อน ๆ ค้นพบกลิ่นใหม่</p></div><Link href="/rankings" className="primary-pill">ร่วมค้นหากลิ่นโปรด ↗</Link></section></>}
      </div>
    </main>
  );
}
