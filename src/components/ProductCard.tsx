import Link from "next/link";
import ProductImage from "./ProductImage";
import StockBadge from "./StockBadge";
import { formatPrice, stockStatus } from "@/lib/format";
import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const soldOut = stockStatus(product) === "out";

  return (
    <li>
      <Link
        href={`/products/${product.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-colors hover:border-brand"
      >
        <ProductImage
          categoryId={product.category_id}
          imageUrl={product.image_url}
          alt=""
          className={`aspect-square w-full ${soldOut ? "opacity-50 grayscale" : ""}`}
        />
        <div className="flex flex-1 flex-col gap-1 p-3">
          <span className="text-xs text-ink-soft">{product.category_name}</span>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-brand">
            {product.name}
          </h3>
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <span className="text-lg font-bold text-brand-deep">{formatPrice(product.price)}</span>
            <StockBadge product={product} />
          </div>
        </div>
      </Link>
    </li>
  );
}
