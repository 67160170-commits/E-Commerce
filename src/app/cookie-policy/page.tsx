import type { Metadata } from "next";
import Link from "next/link";
import CookieSettingsTrigger from "../../components/CookieSettingsTrigger";

export const metadata: Metadata = {
  title: "นโยบายการใช้คุกกี้ (Cookie Policy)",
  description: "รายละเอียดการใช้งานคุกกี้และเทคโนโลยีการติดตามของเว็บไซต์ My YaDom ตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)",
};

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="rounded-2xl border border-line bg-white p-6 sm:p-10 shadow-xs">
        <div className="border-b border-line pb-6">
          <span className="rounded-md bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand uppercase tracking-wider">
            นโยบายความเป็นส่วนตัว (PDPA)
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-ink">
            นโยบายการใช้คุกกี้ (Cookie Policy)
          </h1>
          <p className="mt-2 text-xs text-ink-soft sm:text-sm">
            ฉบับปรับปรุงล่าสุด: เวอร์ชัน 1.0 (ตุลาคม 2569)
          </p>
        </div>

        <div className="mt-6 space-y-6 text-sm text-ink-soft leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-ink mb-2">1. คุกกี้คืออะไร?</h2>
            <p>
              คุกกี้ (Cookies) คือไฟล์ข้อความขนาดเล็กที่ถูกจัดเก็บบนอุปกรณ์คอมพิวเตอร์ แท็บเล็ต หรือสมาร์ตโฟนของคุณเมื่อคุณเข้าชมเว็บไซต์
              คุกกี้ช่วยให้เว็บไซต์จดจำอุปกรณ์และบันทึกข้อมูลการใช้งานของคุณ เพื่อมอบประสบการณ์ที่ดีและสะดวกสบายในการเลือกซื้อสินค้า
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink mb-2">2. ประเภทของคุกกี้ที่เราใช้งาน</h2>
            <p className="mb-4">
              ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) เราได้จำแนกคุกกี้ออกเป็น 2 กลุ่มหลักดังนี้:
            </p>

            <div className="space-y-4">
              <div className="rounded-xl border border-line bg-paper/50 p-4">
                <div className="flex items-center gap-2 font-bold text-ink mb-1">
                  <span className="rounded bg-brand px-1.5 py-0.5 text-xs text-white">จำเป็น</span>
                  <span>1. คุกกี้ที่จำเป็นอย่างยิ่ง (Strictly Necessary Cookies)</span>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed">
                  คุกกี้ประเภทนี้มีความจำเป็นต่อการทำงานพื้นฐานของเว็บไซต์ เช่น การเข้าสู่ระบบบัญชีผู้ใช้ (Session) และการเพิ่มสินค้าลงในตะกร้าสินค้า
                  เว็บไซต์ไม่สามารถทำงานได้อย่างถูกต้องหากไม่มีคุกกี้เหล่านี้ จึง<b>ไม่ต้องขอความยินยอม</b>ตามกฎหมาย แต่เราต้องแจ้งให้คุณทราบถึงวัตถุประสงค์
                </p>
              </div>

              <div className="rounded-xl border border-line bg-paper/50 p-4">
                <div className="flex items-center gap-2 font-bold text-ink mb-1">
                  <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-700">ต้องยินยอม</span>
                  <span>2. คุกกี้เพื่อการวิเคราะห์และวัดผล (Analytics Cookies)</span>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed">
                  ช่วยให้เราเข้าใจพฤติกรรมการใช้งานของผู้เข้าชม เช่น หน้าที่มีผู้เข้าชมมากที่สุด และเวลาที่ใช้บนเว็บไซต์ เพื่อนำไปปรับปรุงประสิทธิภาพของระบบ
                  <b>ต้องได้รับความยินยอมจากคุณก่อน จึงจะเริ่มทำงาน</b>
                </p>
              </div>

              <div className="rounded-xl border border-line bg-paper/50 p-4">
                <div className="flex items-center gap-2 font-bold text-ink mb-1">
                  <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-700">ต้องยินยอม</span>
                  <span>3. คุกกี้เพื่อการใช้งานและฟังก์ชัน (Functional Cookies)</span>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed">
                  ช่วยจดจำการตั้งค่าและตัวเลือกของคุณ เช่น ภาษาที่เลือก หรือการปรับแต่งหน้าจอ เพื่ออำนวยความสะดวกในการใช้งานครั้งต่อไป
                  <b>ต้องได้รับความยินยอมจากคุณก่อน จึงจะเริ่มทำงาน</b>
                </p>
              </div>

              <div className="rounded-xl border border-line bg-paper/50 p-4">
                <div className="flex items-center gap-2 font-bold text-ink mb-1">
                  <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-700">ต้องยินยอม</span>
                  <span>4. คุกกี้เพื่อการตลาดและการโฆษณา (Marketing Cookies)</span>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed">
                  ใช้เพื่อนำเสนอโปรโมชัน ข่าวสารผลิตภัณฑ์วิตามิน และแคมเปญที่ตรงกับความสนใจของคุณ
                  <b>ต้องได้รับความยินยอมจากคุณก่อน จึงจะเริ่มทำงาน</b>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink mb-2">3. ตารางรายละเอียดคุกกี้ที่ใช้ในระบบ</h2>
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-line bg-paper text-ink font-semibold">
                  <tr>
                    <th className="p-3">ชื่อคุกกี้</th>
                    <th className="p-3">ประเภท</th>
                    <th className="p-3">ผู้ให้บริการ</th>
                    <th className="p-3">ระยะเวลาเก็บ</th>
                    <th className="p-3">วัตถุประสงค์</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  <tr>
                    <td className="p-3 font-mono font-semibold text-ink">vitashop_session</td>
                    <td className="p-3 text-brand font-medium">จำเป็น (Necessary)</td>
                    <td className="p-3">My YaDom (First party)</td>
                    <td className="p-3">7 วัน (Persistent)</td>
                    <td className="p-3">รักษาสถานะเข้าสู่ระบบของผู้ใช้งานอย่างปลอดภัย</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-ink">vitashop_cart</td>
                    <td className="p-3 text-brand font-medium">จำเป็น (Necessary)</td>
                    <td className="p-3">My YaDom (First party)</td>
                    <td className="p-3">30 วัน (Persistent)</td>
                    <td className="p-3">จดจำรายการสินค้าที่ผู้ใช้เลือกไว้ในตะกร้า</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-ink">vitashop_cookie_consent</td>
                    <td className="p-3 text-brand font-medium">จำเป็น (Necessary)</td>
                    <td className="p-3">My YaDom (First party)</td>
                    <td className="p-3">1 ปี (Local Storage)</td>
                    <td className="p-3">บันทึกตัวเลือกความยินยอมคุกกี้ของผู้ใช้ ไม่ต้องถามซ้ำทุกครั้ง</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-line bg-brand/5 p-5">
            <h2 className="text-base font-bold text-ink mb-2">
              4. การจัดการและเปลี่ยนแปลงความยินยอมของคุณ
            </h2>
            <p className="mb-4 text-xs">
              คุณสามารถเปลี่ยนใจหรือถอนความยินยอมในการใช้งานคุกกี้ที่ไม่จำเป็นได้ตลอดเวลา โดยการคลิกปุ่มด้านล่างนี้ หรือคลิกลิงก์ &ldquo;ตั้งค่าคุกกี้&rdquo; ที่ส่วนท้ายของเว็บไซต์ (Footer) ทุกหน้า
            </p>

            <CookieSettingsTrigger />
          </section>
        </div>

        <div className="mt-8 border-t border-line pt-6">
          <Link
            href="/"
            className="text-sm font-semibold text-brand hover:underline"
          >
            ← กลับสู่หน้าหลัก My YaDom
          </Link>
        </div>
      </div>
    </main>
  );
}
