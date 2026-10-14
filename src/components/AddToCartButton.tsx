"use client";

import { useState, useTransition } from "react";
import { addToCartAction } from "@/app/actions/cart";

type Props = {
  productId: number;
  stock: number;
  showQuantityPicker?: boolean;
  className?: string;
};

export default function AddToCartButton({
  productId,
  stock,
  showQuantityPicker = false,
  className = "",
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isOutOfStock = stock <= 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    setErrorMessage("");

    startTransition(async () => {
      const res = await addToCartAction(productId, quantity);
      if (res.success) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      } else {
        setErrorMessage(res.error || "เกิดข้อผิดพลาด");
      }
    });
  };

  if (isOutOfStock) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-xl bg-gray-200 px-6 py-3.5 font-medium text-gray-500 cursor-not-allowed"
      >
        สินค้าหมดชั่วคราว
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className={`flex flex-wrap items-center gap-3 ${className}`}>
        {showQuantityPicker && (
          <div className="flex items-center rounded-xl border border-line bg-white">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || isPending}
              className="px-3.5 py-3 text-ink-soft hover:text-brand disabled:opacity-40"
              aria-label="ลดจำนวน"
            >
              −
            </button>
            <span className="w-10 text-center font-semibold text-ink">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
              disabled={quantity >= stock || isPending}
              className="px-3.5 py-3 text-ink-soft hover:text-brand disabled:opacity-40"
              aria-label="เพิ่มจำนวน"
            >
              +
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleAdd}
          disabled={isPending}
          id={`add-to-cart-btn-${productId}`}
          className={`flex-1 min-w-[160px] rounded-xl px-6 py-3.5 font-semibold text-white shadow-sm transition-all ${
            added
              ? "bg-emerald-600"
              : "bg-brand hover:bg-brand-deep active:scale-[0.99]"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {isPending ? "กำลังเพิ่ม..." : added ? "เพิ่มลงตะกร้าแล้ว ✓" : "เพิ่มลงตะกร้า"}
        </button>
      </div>

      {errorMessage && (
        <p className="text-xs font-medium text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}
