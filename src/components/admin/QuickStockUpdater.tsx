"use client";

import { useState, useTransition } from "react";
import { updateStockAction } from "@/app/actions/admin";

export default function QuickStockUpdater({
  productId,
  initialStock,
  lowStockThreshold,
}: {
  productId: number;
  initialStock: number;
  lowStockThreshold: number;
}) {
  const [stock, setStock] = useState(initialStock);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isLow = stock <= lowStockThreshold && stock > 0;
  const isOut = stock === 0;

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateStockAction(productId, stock);
      if (res.success) {
        setIsEditing(false);
      }
    });
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <span
          className={`font-mono text-sm font-bold ${
            isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-ink"
          }`}
        >
          {stock}
        </span>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded p-1 text-xs text-ink-soft hover:bg-paper hover:text-brand"
          title="แก้ไขจำนวนสต็อกอย่างรวดเร็ว"
        >
          ✏️
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={0}
        value={stock}
        onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
        className="w-16 rounded border border-line bg-white px-1.5 py-0.5 text-xs font-mono font-bold focus:border-brand focus:outline-none"
      />
      <button
        type="button"
        disabled={isPending}
        onClick={handleSave}
        className="rounded bg-brand px-2 py-0.5 text-xs font-semibold text-white hover:bg-brand-deep disabled:opacity-50"
      >
        ✓
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setStock(initialStock);
          setIsEditing(false);
        }}
        className="rounded border border-line px-1.5 py-0.5 text-xs text-ink-soft hover:bg-gray-100"
      >
        ✕
      </button>
    </div>
  );
}
