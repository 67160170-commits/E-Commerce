import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getAdminProduct } from "@/lib/admin";
import { listCategories } from "@/lib/products";

export const metadata: Metadata = {
  title: "แก้ไขข้อมูลสินค้า",
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) notFound();

  const product = getAdminProduct(productId);
  if (!product) notFound();

  const categories = listCategories();

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-xs">
      <div className="border-b border-line pb-4 mb-6">
        <h2 className="text-xl font-bold text-ink">แก้ไขสินค้า: {product.name}</h2>
        <p className="mt-1 text-xs text-ink-soft">
          รหัสสินค้า: #{product.id} • หมวดหมู่: {product.category_name}
        </p>
      </div>

      <ProductForm categories={categories} initialData={product} />
    </div>
  );
}
