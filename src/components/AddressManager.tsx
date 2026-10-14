"use client";

import { useActionState, useTransition } from "react";
import type { Address } from "@/lib/addresses";
import {
  addAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  type AddressActionState,
} from "@/app/actions/addresses";

export default function AddressManager({
  addresses,
  defaultRecipientName,
}: {
  addresses: Address[];
  defaultRecipientName: string;
}) {
  const [state, formAction, isPending] = useActionState<AddressActionState | null, FormData>(
    addAddressAction,
    null
  );
  const [isMutating, startTransition] = useTransition();

  const handleDelete = (id: number) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบที่อยู่นี้?")) {
      startTransition(async () => {
        await deleteAddressAction(id);
      });
    }
  };

  const handleSetDefault = (id: number) => {
    startTransition(async () => {
      await setDefaultAddressAction(id);
    });
  };

  return (
    <div className="space-y-6">
      {/* รายการที่อยู่ที่บันทึกไว้ */}
      <div className="space-y-3">
        {addresses.length === 0 ? (
          <p className="text-sm text-ink-soft py-2">ยังไม่มีที่อยู่จัดส่งที่บันทึกไว้</p>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className={`flex flex-col gap-3 rounded-xl border p-4 transition-all sm:flex-row sm:items-start sm:justify-between ${
                addr.is_default === 1
                  ? "border-brand bg-brand/5"
                  : "border-line bg-white"
              }`}
            >
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">{addr.recipient_name}</span>
                  <span className="text-xs text-ink-soft">({addr.phone})</span>
                  {addr.is_default === 1 && (
                    <span className="rounded bg-brand px-1.5 py-0.5 text-[11px] font-medium text-white">
                      ที่อยู่เริ่มต้น
                    </span>
                  )}
                </div>
                <p className="mt-1 text-ink-soft leading-relaxed">{addr.address_line}</p>
              </div>

              <div className="flex items-center gap-2 pt-2 sm:pt-0">
                {addr.is_default !== 1 && (
                  <button
                    type="button"
                    disabled={isMutating}
                    onClick={() => handleSetDefault(addr.id)}
                    className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-ink hover:border-brand hover:text-brand disabled:opacity-40"
                  >
                    ตั้งเป็นเริ่มต้น
                  </button>
                )}
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={() => handleDelete(addr.id)}
                  className="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ฟอร์มเพิ่มที่อยู่ใหม่ */}
      <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <h3 className="font-bold text-ink mb-3 text-sm">เพิ่มที่อยู่จัดส่งใหม่</h3>

        {state?.error && (
          <div className="mb-3 rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-700">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="modal_recipient_name" className="block text-xs font-medium text-ink">
                ชื่อผู้รับ
              </label>
              <input
                type="text"
                id="modal_recipient_name"
                name="recipient_name"
                defaultValue={defaultRecipientName}
                required
                className="mt-1 block w-full rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="modal_phone" className="block text-xs font-medium text-ink">
                เบอร์โทรศัพท์
              </label>
              <input
                type="tel"
                id="modal_phone"
                name="phone"
                required
                placeholder="081-xxx-xxxx"
                className="mt-1 block w-full rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="modal_address_line" className="block text-xs font-medium text-ink">
              ที่อยู่จัดส่ง
            </label>
            <textarea
              id="modal_address_line"
              name="address_line"
              rows={2}
              required
              placeholder="เลขที่ ซอย ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
              className="mt-1 block w-full rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
            <input
              type="checkbox"
              name="is_default"
              className="rounded border-line text-brand focus:ring-brand"
            />
            ตั้งเป็นที่อยู่จัดส่งเริ่มต้น
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-deep disabled:opacity-60"
          >
            {isPending ? "กำลังบันทึก..." : "บันทึกที่อยู่"}
          </button>
        </form>
      </div>
    </div>
  );
}
