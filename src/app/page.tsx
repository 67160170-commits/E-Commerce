import Link from "next/link";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import { SORT_OPTIONS, catalogHref, isSortKey, type SortKey } from "@/lib/catalog-url";
import { listCategories, listProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CatalogPage(props: PageProps<"/">) {
  const params = await props.searchParams;

  const q = (firstValue(params.q) ?? "").trim().slice(0, 100);
  const categoryId = Number(firstValue(params.category)) || undefined;
  const sortParam = firstValue(params.sort);
  const sort: SortKey = isSortKey(sortParam) ? sortParam : "recommended";

  const categories = listCategories();
  const activeCategory = categories.find((category) => category.id === categoryId);
  const products = listProducts({ q, categoryId: activeCategory?.id, sort });
  const filtered = Boolean(q || activeCategory);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">วิตามินและอาหารเสริม</h1>
      <p className="mt-1 text-ink-soft">ค้นหาจากชื่อหรือรายละเอียดสินค้า หรือเลือกดูตามหมวดหมู่</p>

      <form action="/" method="get" role="search" className="mt-5 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          maxLength={100}
          placeholder="เช่น วิตามินซี, น้ำมันปลา"
          aria-label="ค้นหาสินค้า"
          className="min-w-0 flex-1 rounded-lg border border-line bg-white px-4 py-2.5 placeholder:text-ink-soft/70"
        />
        {activeCategory && <input type="hidden" name="category" value={activeCategory.id} />}
        {sort !== "recommended" && <input type="hidden" name="sort" value={sort} />}
        <button
          type="submit"
          className="rounded-lg bg-brand px-6 py-2.5 font-medium text-white hover:bg-brand-deep"
        >
          ค้นหา
        </button>
      </form>

      <div className="mt-4">
        <CategoryFilter categories={categories} activeId={activeCategory?.id} q={q} sort={sort} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm">
        <p aria-live="polite">
          พบ <strong>{products.length}</strong> รายการ
          {q && <> สำหรับ “{q}”</>}
          {activeCategory && <> ในหมวด {activeCategory.name}</>}
          {filtered && (
            <>
              {" "}
              <Link href="/" className="ml-1 text-brand underline underline-offset-2">
                ล้างตัวกรอง
              </Link>
            </>
          )}
        </p>
        <nav aria-label="เรียงลำดับสินค้า" className="flex items-center gap-3">
          <span className="text-ink-soft">เรียงตาม</span>
          {SORT_OPTIONS.map((option) => (
            <Link
              key={option.key}
              href={catalogHref({ q, category: activeCategory?.id, sort: option.key })}
              aria-current={sort === option.key ? "true" : undefined}
              className={
                sort === option.key
                  ? "font-semibold text-brand"
                  : "text-ink-soft hover:text-brand"
              }
            >
              {option.label}
            </Link>
          ))}
        </nav>
      </div>

      {products.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-line bg-white p-10 text-center">
          <p className="font-medium">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
          <p className="mt-1 text-sm text-ink-soft">ลองค้นหาด้วยคำที่สั้นลง หรือเปลี่ยนหมวดหมู่</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-deep"
          >
            ดูสินค้าทั้งหมด
          </Link>
        </div>
      )}
    </main>
  );
}
