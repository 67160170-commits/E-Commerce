import Link from "next/link";
import ProductImage from "./ProductImage";
import StockBadge from "./StockBadge";
import AddToCartButton from "./AddToCartButton";
import { formatPrice, stockStatus } from "@/lib/format";
import { LOW_REVIEW_THRESHOLD } from "@/lib/ranking";
import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  return <li className="product-card">
    <Link href={`/products/${product.id}`} className="group block">
      <div className="product-art"><ProductImage categoryId={product.category_id} imageUrl={product.image_url} alt="" className={`aspect-square w-full transition-transform duration-300 group-hover:scale-105 ${stockStatus(product) === "out" ? "opacity-50 grayscale" : ""}`} /><span className="product-category">{product.category_name}</span></div>
      <div className="px-4 pt-4"><p className="text-[11px] tracking-widest text-ink-soft">{product.brand || "MY YADOM COLLECTION"}</p><h3 className="mt-2 min-h-12 text-sm font-semibold leading-6 group-hover:text-brand">{product.name}</h3><p className="mt-2 text-xs text-ink-soft">{product.review_count ? <><span className="font-semibold text-brand">★ {product.average_rating?.toFixed(2)}</span> · {product.review_count} คะแนน {product.review_count < LOW_REVIEW_THRESHOLD && <span className="ml-1 inline-flex rounded-full bg-amber-100 px-2 py-1 text-amber-800">คะแนนยังน้อย</span>}</> : "☆ ยังไม่มีคะแนน · มาเป็นคนแรก"}</p></div>
    </Link>
    <div className="mt-auto px-4 pb-4"><div className="my-4 flex flex-wrap items-center justify-between gap-2"><span className="text-xl font-bold text-brand-deep">{formatPrice(product.price)}</span><StockBadge product={product} /></div><AddToCartButton productId={product.id} stock={product.stock} /></div>
  </li>;
}
