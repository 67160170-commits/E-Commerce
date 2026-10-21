"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Category } from "@/lib/products";
import type { AdminProduct } from "@/lib/admin";
import {
  createProductAction,
  updateProductAction,
  type AdminActionState,
} from "@/app/actions/admin";

type Props = {
  categories: Category[];
  initialData?: AdminProduct;
};

export default function ProductForm({ categories, initialData }: Props) {
  const isEdit = Boolean(initialData);

  const actionFn = isEdit
    ? updateProductAction.bind(null, initialData!.id)
    : createProductAction;

  const [state, formAction, isPending] = useActionState<AdminActionState | null, FormData>(
    actionFn,
    null
  );

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {state.error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {/* ชื่อสินค้า */}
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-ink">
            ชื่อสินค้า <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={initialData?.name}
            placeholder="เช่น โป๊ยเซียน มาร์คทู"
            className="mt-1 block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand focus:outline-none"
          />
        </div>

        {/* หมวดหมู่ */}
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-ink">
            หมวดหมู่สินค้า <span className="text-red-500">*</span>
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            defaultValue={initialData?.category_id ?? categories[0]?.id}
            className="mt-1 block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* ราคา */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-ink">
            ราคาขาย (บาท) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="price"
            name="price"
            required
            min={0}
            step={1}
            defaultValue={initialData?.price ?? 299}
            className="mt-1 block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand focus:outline-none font-mono"
          />
        </div>

        {/* จำนวนสต็อก */}
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-ink">
            จำนวนสต็อกปัจจุบัน <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            required
            min={0}
            step={1}
            defaultValue={initialData?.stock ?? 20}
            className="mt-1 block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand focus:outline-none font-mono"
          />
        </div>

        {/* เกณฑ์แจ้งเตือนสต็อกต่ำ */}
        <div>
          <label htmlFor="low_stock_threshold" className="block text-sm font-medium text-ink">
            เกณฑ์แจ้งเตือนสต็อกต่ำ (ชิ้น)
          </label>
          <input
            type="number"
            id="low_stock_threshold"
            name="low_stock_threshold"
            required
            min={0}
            step={1}
            defaultValue={initialData?.low_stock_threshold ?? 10}
            className="mt-1 block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand focus:outline-none font-mono"
          />
          <p className="mt-1 text-xs text-ink-soft">
            ระบบจะแสดงป้ายเตือนเมื่อสต็อกเหลือน้อยกว่าหรือเท่ากับค่านี้
          </p>
        </div>

        {/* ลิงก์รูปภาพ */}
        <div className="sm:col-span-2">
          <label htmlFor="image_url" className="block text-sm font-medium text-ink">
            ลิงก์รูปภาพสินค้า (Image URL)
          </label>
          <input
            type="url"
            id="image_url"
            name="image_url"
            defaultValue={initialData?.image_url ?? ""}
            placeholder="https://example.com/image.jpg (หากว่างไว้จะใช้ภาพขวด placeholder ประจำหมวด)"
            className="mt-1 block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand focus:outline-none"
          />
        </div>

        {/* คำอธิบาย */}
        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-ink">
            คำอธิบายรายละเอียดสินค้า
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={initialData?.description ?? ""}
            placeholder="ระบุสรรพคุณ ส่วนประกอบ และวิธีรับประทาน..."
            className="mt-1 block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand focus:outline-none"
          />
        </div>

        {/* สถานะการจำหน่าย (สำหรับโหมดแก้ไข) */}
        {isEdit && (
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink">
              <input
                type="checkbox"
                name="is_active"
                value="1"
                defaultChecked={initialData?.is_active === 1}
                className="rounded border-line text-brand focus:ring-brand"
              />
              เปิดให้ลูกค้ามองเห็นและสั่งซื้อสินค้านี้ (Active)
            </label>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-line pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-deep disabled:opacity-60"
        >
          {isPending
            ? isEdit
              ? "กำลังบันทึก..."
              : "กำลังเพิ่มสินค้า..."
            : isEdit
            ? "บันทึกการแก้ไข"
            : "เพิ่มสินค้าใหม่"}
        </button>
        <Link
          href="/admin/inventory"
          className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-gray-100"
        >
          ยกเลิก
        </Link>
      </div>
    </form>
  );
}
