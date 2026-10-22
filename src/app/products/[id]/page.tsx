import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductImage from "@/components/ProductImage";
import StockBadge from "@/components/StockBadge";
import AddToCartButton from "@/components/AddToCartButton";
import { catalogHref } from "@/lib/catalog-url";
import { formatPrice, stockStatus } from "@/lib/format";
import { getProduct } from "@/lib/products";
import { getCurrentUser } from "@/lib/auth";
import { getMyReview, listReviews } from "@/lib/reviews";
import ReviewForm from "@/components/ReviewForm";
import { LOW_REVIEW_THRESHOLD } from "@/lib/ranking";
import { PRODUCT_DETAIL_LABELS } from "@/lib/product-fields";
import type { ProductDetails } from "@/lib/product-fields";
import photoSources from "../../../../public/products/photos/sources.json";

export const dynamic = "force-dynamic";

function parseId(raw: string): number | undefined {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

export async function generateMetadata(props: PageProps<"/products/[id]">): Promise<Metadata> {
  const id = parseId((await props.params).id);
  const product = id ? getProduct(id) : undefined;
  return { title: product?.name ?? "ไม่พบสินค้า" };
}

export default async function ProductPage(props: PageProps<"/products/[id]">) {
  const id = parseId((await props.params).id);
  const product = id ? getProduct(id) : undefined;
  if (!product) notFound();

  const photoSource = photoSources.find((photo) => photo.file === product.image_url);
  const status = stockStatus(product);
  const user = await getCurrentUser();
  const reviews = listReviews(product.id);
  const myReview = user ? getMyReview(product.id, user.id) : undefined;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <nav aria-label="เส้นทางหน้า" className="text-sm text-ink-soft">
        <Link href="/" className="hover:text-brand">
          สินค้าทั้งหมด
        </Link>
        <span aria-hidden> / </span>
        <Link href={catalogHref({ category: product.category_id })} className="hover:text-brand">
          {product.category_name}
        </Link>
      </nav>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div>
          <ProductImage
            categoryId={product.category_id}
            imageUrl={product.image_url}
            alt={product.name}
            className="aspect-square w-full rounded-xl border border-line bg-white"
          />
          {photoSource && (
            <p className="mt-3 text-xs leading-6 text-ink-soft">
              ภาพสินค้า: <a href={photoSource.sourcePage} target="_blank" rel="noopener noreferrer" className="text-brand underline">{photoSource.credit}</a>
              <br />ภาพอาจแสดงสีหรือบรรจุภัณฑ์หลายแบบ ราคาต่อสินค้า 1 ชิ้น
            </p>
          )}
        </div>

        <div>
          <p className="text-sm text-ink-soft">{product.category_name}</p>
          <h1 className="mt-1 text-2xl font-bold leading-snug">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold text-brand-deep">{formatPrice(product.price)}</p>

          <p className="mt-3 text-sm">
            {status === "in" ? (
              <span className="font-medium text-brand">มีสินค้าพร้อมส่ง</span>
            ) : (
              <StockBadge product={product} />
            )}
          </p>

          <h2 className="mt-6 font-semibold">รายละเอียดสินค้า</h2>
          <p className="mt-1 max-w-prose leading-relaxed text-ink-soft">{product.description}</p>
          <p className="mt-4 text-sm text-brand">{product.review_count ? `★ ${product.average_rating?.toFixed(2)} / 5 จาก ${product.review_count} คะแนนความหอม` : "☆ ยังไม่มีคะแนนความหอม มาเป็นคนแรกที่รีวิว"}</p>
          <p className="mt-3 text-xs leading-6 text-ink-soft">ราคา สต็อก และคำบรรยายกลิ่นเป็นข้อมูลตัวอย่าง บรรจุภัณฑ์อาจเปลี่ยนตามรุ่นการผลิต</p>

          {product.review_count > 0 && product.review_count < LOW_REVIEW_THRESHOLD && <p className="mt-2 text-xs text-ink-soft"><span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-amber-800">คะแนนยังน้อย</span> · มีผู้ให้คะแนน {product.review_count} คน อันดับอาจเปลี่ยนเมื่อมีคะแนนเพิ่ม</p>}
          <dl className="mt-5 divide-y divide-line rounded-xl border border-line bg-white px-4">{(Object.keys(PRODUCT_DETAIL_LABELS) as (keyof ProductDetails)[]).map(field => product[field] && <div key={field} className="grid gap-1 py-3 text-sm sm:grid-cols-[130px_1fr]"><dt className="font-medium">{PRODUCT_DETAIL_LABELS[field]}</dt><dd className="break-words leading-7 text-ink-soft">{field === "source_url" && /^https?:\/\//.test(product[field]) ? <a href={product[field]} target="_blank" rel="noopener noreferrer" className="text-brand underline">ดูข้อมูลจากแบรนด์หรือร้านค้า ↗</a> : product[field]}</dd></div>)}</dl>
          <div className="mt-8">
            <AddToCartButton
              productId={product.id}
              stock={product.stock}
              showQuantityPicker={true}
            />
          </div>
        </div>
      </div>
      <section id="reviews" className="mt-14 scroll-mt-36 border-t border-line pt-8">
        <p className="eyebrow">YOUR SCENT, YOUR SAY</p>
        <h2 className="mt-2 text-2xl font-bold">รีวิวความหอม</h2>
        <p className="mt-2 text-sm text-ink-soft">ความชอบส่วนบุคคลจากสมาชิกทั่วไป ไม่ได้ยืนยันการซื้อ · แสดงรีวิวล่าสุดสูงสุด 50 รายการ</p>
        <div className="mt-6 grid items-start gap-6 md:grid-cols-2">
          {user ? <ReviewForm productId={product.id} existing={myReview} /> : <div className="rounded-2xl border border-line bg-white p-6"><h3 className="font-semibold">เคยลองกลิ่นนี้แล้ว?</h3><p className="mt-2 text-sm text-ink-soft">เข้าสู่ระบบเพื่อให้คะแนน และร่วมจัดอันดับยาดมที่คุณชอบ</p><Link href={`/login?redirect=${encodeURIComponent(`/products/${product.id}#reviews`)}`} className="mt-5 inline-block rounded-full bg-brand px-6 py-3 text-sm text-white">เข้าสู่ระบบเพื่อให้คะแนน ↗</Link></div>}
          <div className="space-y-3">{reviews.length ? reviews.map((review) => <article key={review.id} className="rounded-2xl border border-line bg-white p-5"><div className="flex flex-wrap justify-between gap-2 text-sm"><h3 className="font-semibold">{review.name}</h3><span className="font-semibold text-brand">★ {review.rating} / 5</span></div>{review.comment && <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-ink-soft">{review.comment}</p>}<p className="mt-3 text-xs text-ink-soft">อัปเดต {new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeZone: "Asia/Bangkok" }).format(new Date(`${review.updated_at.replace(" ", "T")}Z`))}</p></article>) : <p className="rounded-2xl border border-dashed border-line p-8 text-sm text-ink-soft">ยังไม่มีรีวิว ให้กลิ่นโปรดของคุณเริ่มต้นบทสนทนา</p>}</div>
        </div>
      </section>
    </main>
  );
}
