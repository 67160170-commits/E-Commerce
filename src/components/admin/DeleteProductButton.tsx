"use client";

import { useState, useTransition } from "react";
import { deleteProductAction } from "@/app/actions/admin";

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: number;
  productName: string;
}) {
  const [isPending, startTransition] = useTransition();

  const [error, setError] = useState("");

  const handleDelete = () => {
    if (confirm(`คุณต้องการปิดการจำหน่ายสินค้า "${productName}" ใช่หรือไม่?`)) {
      startTransition(async () => {
        const result = await deleteProductAction(productId);
        setError(result.success ? "" : result.error || "บันทึกไม่สำเร็จ");
      });
    }
  };

  return (
    <span><button
      type="button"
      disabled={isPending}
      onClick={handleDelete}
      className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-40"
      title="ปิดการขายและเก็บประวัติสินค้า"
    >
      {isPending ? "กำลังบันทึก..." : "ปิดการขาย"}
    </button>{error && <span role="alert" className="ml-2 text-xs text-red-700">{error}</span>}</span>
  );
}
