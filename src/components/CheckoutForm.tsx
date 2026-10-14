"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import ProductImage from "./ProductImage";
import { formatPrice } from "@/lib/format";
import type { PopulatedCartItem } from "@/lib/cart";
import type { Address } from "@/lib/addresses";
import { placeOrderAction, type OrderActionState } from "@/app/actions/orders";

type Props = {
  cartItems: PopulatedCartItem[];
  cartTotal: number;
  savedAddresses: Address[];
  userName: string;
};

export default function CheckoutForm({
  cartItems,
  cartTotal,
  savedAddresses,
  userName,
}: Props) {
  const [addressOption, setAddressOption] = useState<"saved" | "new">(
    savedAddresses.length > 0 ? "saved" : "new"
  );
  const [selectedAddressId, setSelectedAddressId] = useState<number>(
    savedAddresses.find((a) => a.is_default === 1)?.id ?? (savedAddresses[0]?.id ?? 0)
  );
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer">("cod");

  const [state, formAction, isPending] = useActionState<OrderActionState | null, FormData>(
    placeOrderAction,
    null
  );

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-3">
      <input type="hidden" name="address_option" value={addressOption} />

      <div className="space-y-6 lg:col-span-2">
        {state?.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {state.error}
          </div>
        )}

        {/* 1. ที่อยู่สำหรับจัดส่ง */}
        <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-ink">1. ที่อยู่จัดส่งสินค้า</h2>

          {savedAddresses.length > 0 && (
            <div className="mt-4 flex gap-4 border-b border-line pb-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="_address_type_selector"
                  checked={addressOption === "saved"}
                  onChange={() => setAddressOption("saved")}
                  className="text-brand focus:ring-brand"
                />
                ใช้ที่อยู่ที่บันทึกไว้
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="_address_type_selector"
                  checked={addressOption === "new"}
                  onChange={() => setAddressOption("new")}
                  className="text-brand focus:ring-brand"
                />
                กรอกที่อยู่ใหม่
              </label>
            </div>
          )}

          {addressOption === "saved" && savedAddresses.length > 0 ? (
            <div className="mt-4 space-y-3">
              <input type="hidden" name="saved_address_id" value={selectedAddressId} />
              {savedAddresses.map((addr) => (
                <label
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                    selectedAddressId === addr.id
                      ? "border-brand bg-brand/5 shadow-sm"
                      : "border-line bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="address_choice"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="mt-1 text-brand focus:ring-brand"
                  />
                  <div className="flex-1 text-sm">
                    <div className="flex items-center gap-2 font-semibold text-ink">
                      <span>{addr.recipient_name}</span>
                      <span className="text-xs text-ink-soft">({addr.phone})</span>
                      {addr.is_default === 1 && (
                        <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[11px] font-medium text-brand">
                          ที่อยู่เริ่มต้น
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-ink-soft leading-relaxed">{addr.address_line}</p>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="recipient_name" className="block text-sm font-medium text-ink">
                  ชื่อ-นามสกุล ผู้รับ
                </label>
                <input
                  type="text"
                  id="recipient_name"
                  name="recipient_name"
                  defaultValue={userName}
                  required={addressOption === "new"}
                  placeholder="เช่น สมชาย ใจดี"
                  className="mt-1 block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-ink">
                  เบอร์โทรศัพท์ติดต่อ
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required={addressOption === "new"}
                  placeholder="เช่น 081-234-5678"
                  className="mt-1 block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="address_line" className="block text-sm font-medium text-ink">
                  ที่อยู่จัดส่ง (บ้านเลขที่, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์)
                </label>
                <textarea
                  id="address_line"
                  name="address_line"
                  rows={3}
                  required={addressOption === "new"}
                  placeholder="กรอกรายละเอียดที่อยู่จัดส่ง..."
                  className="mt-1 block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-ink cursor-pointer pt-1">
                <input
                  type="checkbox"
                  name="save_address"
                  defaultChecked
                  className="rounded border-line text-brand focus:ring-brand"
                />
                บันทึกที่อยู่นี้ไว้ในสมุดที่อยู่สำหรับใช้งานครั้งต่อไป
              </label>
            </div>
          )}
        </section>

        {/* 2. วิธีการชำระเงิน */}
        <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-ink">2. วิธีการชำระเงิน</h2>
          <input type="hidden" name="payment_method" value={paymentMethod} />

          <div className="mt-4 space-y-3">
            <label
              onClick={() => setPaymentMethod("cod")}
              className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                paymentMethod === "cod"
                  ? "border-brand bg-brand/5 shadow-sm"
                  : "border-line bg-white hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="_payment_selector"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
                className="mt-1 text-brand focus:ring-brand"
              />
              <div className="text-sm">
                <span className="font-semibold text-ink">ชำระเงินปลายทาง (Cash on Delivery)</span>
                <p className="mt-0.5 text-xs text-ink-soft">
                  ชำระเงินสดกับเจ้าหน้าที่จัดส่งพัสดุเมื่อได้รับสินค้าถึงบ้าน
                </p>
              </div>
            </label>

            <label
              onClick={() => setPaymentMethod("bank_transfer")}
              className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                paymentMethod === "bank_transfer"
                  ? "border-brand bg-brand/5 shadow-sm"
                  : "border-line bg-white hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="_payment_selector"
                checked={paymentMethod === "bank_transfer"}
                onChange={() => setPaymentMethod("bank_transfer")}
                className="mt-1 text-brand focus:ring-brand"
              />
              <div className="text-sm">
                <span className="font-semibold text-ink">โอนเงินผ่านบัญชีธนาคาร (Bank Transfer)</span>
                <p className="mt-0.5 text-xs text-ink-soft">
                  โอนเงินผ่าน Mobile Banking บัญชีธนาคารกสิกรไทย 123-4-56789-0 (VitaShop)
                </p>
              </div>
            </label>
          </div>
        </section>
      </div>

      {/* สรุปรายการสินค้าและปุ่มยืนยัน */}
      <div className="lg:col-span-1">
        <div className="rounded-xl border border-line bg-white p-6 shadow-sm sticky top-20">
          <h2 className="text-lg font-bold text-ink border-b border-line pb-3">
            สรุปคำสั่งซื้อ ({cartItems.length} รายการ)
          </h2>

          <div className="mt-4 max-h-60 overflow-y-auto divide-y divide-line/60 pr-1">
            {cartItems.map(({ product, quantity, subtotal }) => (
              <div key={product.id} className="py-2.5 flex items-center gap-3 text-xs">
                <ProductImage
                  categoryId={product.category_id}
                  imageUrl={product.image_url}
                  alt={product.name}
                  className="h-10 w-10 shrink-0 rounded border border-line object-cover"
                />
                <div className="flex-1 truncate">
                  <p className="font-medium text-ink truncate">{product.name}</p>
                  <p className="text-ink-soft">จำนวน {quantity} ชิ้น</p>
                </div>
                <div className="font-semibold text-ink">{formatPrice(subtotal)}</div>
              </div>
            ))}
          </div>

          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between text-ink-soft">
              <dt>ยอดรวมสินค้า</dt>
              <dd className="font-medium text-ink">{formatPrice(cartTotal)}</dd>
            </div>
            <div className="flex justify-between text-ink-soft">
              <dt>ค่าจัดส่ง</dt>
              <dd className="font-medium text-emerald-700">ส่งฟรี</dd>
            </div>
            <div className="border-t border-line pt-3 flex justify-between text-base font-bold text-ink">
              <dt>ยอดชำระสุทธิ</dt>
              <dd className="text-xl text-brand-deep">{formatPrice(cartTotal)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={isPending}
            id="place-order-btn"
            className="mt-6 w-full rounded-xl bg-brand py-3.5 font-bold text-white shadow-sm transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "กำลังดำเนินการสั่งซื้อ..." : "ยืนยันการสั่งซื้อ"}
          </button>

          <Link
            href="/cart"
            className="mt-3 block text-center text-xs text-ink-soft hover:text-brand"
          >
            ← กลับไปแก้ไขตะกร้าสินค้า
          </Link>
        </div>
      </div>
    </form>
  );
}
