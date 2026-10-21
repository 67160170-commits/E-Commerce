"use client";

import { useActionState } from "react";
import { saveReviewAction } from "@/app/actions/reviews";

export default function ReviewForm({ productId, existing }: {
  productId: number; existing?: { rating: number; comment: string };
}) {
  const [state, action, pending] = useActionState(saveReviewAction, null);
  return (
    <form action={action} className="rounded-2xl border border-line bg-white p-6">
      <input type="hidden" name="productId" value={productId} />
      <h3 className="text-lg font-bold">กลิ่นนี้หอมแค่ไหนสำหรับคุณ?</h3>
      <p className="mt-1 text-sm text-ink-soft">1 บัญชี = 1 คะแนนต่อสินค้า แก้ไขคะแนนเดิมได้เสมอ</p>
      <fieldset className="mt-5">
        <legend className="text-sm font-medium">คะแนนความหอม (1 น้อยที่สุด · 5 มากที่สุด)</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <label key={rating} className="cursor-pointer">
              <input className="peer sr-only" type="radio" name="rating" value={rating} required defaultChecked={existing?.rating === rating} />
              <span className="block rounded-xl border border-line px-4 py-3 text-sm peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand">{rating} ★</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label htmlFor="review-comment" className="mt-5 block text-sm font-medium">เล่าถึงกลิ่นที่คุณสัมผัส (ไม่บังคับ)</label>
      <textarea id="review-comment" name="comment" maxLength={500} rows={3} defaultValue={existing?.comment} placeholder="กลิ่นแบบไหน เหมาะกับใคร…" className="mt-2 w-full rounded-xl border border-line p-3 text-sm" />
      <button disabled={pending} className="mt-3 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-50">{pending ? "กำลังบันทึก…" : existing ? "อัปเดตคะแนนของฉัน" : "ส่งคะแนนความหอม"}</button>
      <p aria-live="polite" className={`mt-3 text-sm ${state?.error ? "text-red-700" : "text-brand"}`}>{state?.error ?? (state?.success ? "บันทึกแล้ว ขอบคุณที่ร่วมจัดอันดับความหอม!" : "")}</p>
    </form>
  );
}
