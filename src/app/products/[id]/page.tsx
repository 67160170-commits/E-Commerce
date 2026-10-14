import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductImage from "@/components/ProductImage";
import StockBadge from "@/components/StockBadge";
import AddToCartButton from "@/components/AddToCartButton";
import { catalogHref } from "@/lib/catalog-url";
import { formatPrice, stockStatus } from "@/lib/format";
import { getProduct } from "@/lib/products";

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

  const status = stockStatus(product);

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
        <ProductImage
          categoryId={product.category_id}
          imageUrl={product.image_url}
          alt={product.name}
          className="aspect-square w-full rounded-xl border border-line"
        />

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

          <div className="mt-8">
            <AddToCartButton
              productId={product.id}
              stock={product.stock}
              showQuantityPicker={true}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
