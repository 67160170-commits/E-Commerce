import type { Metadata } from "next";
import ProductForm from "@/components/admin/ProductForm";
import { listCategories } from "@/lib/products";

export const metadata: Metadata = {
  title: "เพิ่มสินค้าใหม่",
};

export default function NewProductPage() {
  const categories = listCategories(true);

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-xs">
      <div className="border-b border-line pb-4 mb-6">
        <h2 className="text-xl font-bold text-ink">เพิ่มสินค้าใหม่</h2>
        <p className="mt-1 text-xs text-ink-soft">
          กรอกข้อมูลสินค้าเพื่อเพิ่มลงในรายการสินค้าของร้าน
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
