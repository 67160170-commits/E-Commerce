"use client";

import { useTransition } from "react";
import { deleteProductAction } from "@/app/actions/admin";

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: number;
  productName: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`คุณต้องการลบหรือปิดการจำหน่ายสินค้า "${productName}" ใช่หรือไม่?`)) {
      startTransition(async () => {
        await deleteProductAction(productId);
      });
    }
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleDelete}
      className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-40"
      title="ลบหรือปิดการใช้งานสินค้า"
    >
      {isPending ? "กำลังลบ..." : "ลบสินค้า"}
    </button>
  );
}
