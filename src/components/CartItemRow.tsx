"use client";

import { useTransition } from "react";
import Link from "next/link";
import ProductImage from "./ProductImage";
import { formatPrice } from "@/lib/format";
import type { PopulatedCartItem } from "@/lib/cart";
import { removeFromCartAction, updateCartQuantityAction } from "@/app/actions/cart";

export default function CartItemRow({ item }: { item: PopulatedCartItem }) {
  const [isPending, startTransition] = useTransition();
  const { product, quantity, subtotal } = item;

  const handleUpdate = (newQty: number) => {
    startTransition(async () => {
      await updateCartQuantityAction(product.id, newQty);
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      await removeFromCartAction(product.id);
    });
  };

  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border border-line bg-white p-4 transition-opacity sm:flex-row sm:items-center sm:justify-between ${
        isPending ? "opacity-60" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-4">
        <Link href={`/products/${product.id}`} className="shrink-0">
          <ProductImage
            categoryId={product.category_id}
            imageUrl={product.image_url}
            alt={product.name}
            className="h-20 w-20 rounded-lg border border-line object-cover"
          />
        </Link>
        <div className="flex flex-col">
          <span className="text-xs text-ink-soft">{product.category_name}</span>
          <Link
            href={`/products/${product.id}`}
            className="font-medium text-ink hover:text-brand line-clamp-1 sm:line-clamp-2"
          >
            {product.name}
          </Link>
          <span className="text-sm text-ink-soft mt-1">{formatPrice(product.price)} / ชิ้น</span>
          {product.stock <= 5 && product.stock > 0 && (
            <span className="text-xs text-amber-700 mt-0.5">เหลือเพียง {product.stock} ชิ้น</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 border-t border-line/60 pt-3 sm:border-t-0 sm:pt-0">
        {/* ตัวปรับจำนวน */}
        <div className="flex items-center rounded-lg border border-line bg-paper">
          <button
            type="button"
            onClick={() => handleUpdate(quantity - 1)}
            disabled={quantity <= 1 || isPending}
            className="px-2.5 py-1 text-ink-soft hover:text-brand disabled:opacity-40"
            aria-label="ลดจำนวน"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => handleUpdate(quantity + 1)}
            disabled={quantity >= product.stock || isPending}
            className="px-2.5 py-1 text-ink-soft hover:text-brand disabled:opacity-40"
            aria-label="เพิ่มจำนวน"
          >
            +
          </button>
        </div>

        {/* ยอดรวมรายการ */}
        <div className="text-right min-w-[90px]">
          <div className="font-bold text-brand-deep">{formatPrice(subtotal)}</div>
        </div>

        {/* ปุ่มลบ */}
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          className="rounded p-1.5 text-ink-soft hover:text-red-600 hover:bg-red-50 disabled:opacity-40"
          title="ลบออกจากตะกร้า"
          aria-label="ลบออกจากตะกร้า"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
