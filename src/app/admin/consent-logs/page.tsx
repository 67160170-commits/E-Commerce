import type { Metadata } from "next";
import { listConsentLogs } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "บันทึกความยินยอมคุกกี้ (PDPA Consent Logs)",
};

export default async function ConsentLogsPage() {
  const logs = listConsentLogs(50);

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-4">
        <h2 className="text-xl font-bold text-ink">
          บันทึกการให้ความยินยอมคุกกี้ตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล (PDPA)
        </h2>
        <p className="mt-1 text-xs text-ink-soft">
          ตาราง <code className="font-mono text-brand">consent_logs</code> บันทึกหลักฐานการให้/ปฏิเสธความยินยอมของผู้ใช้งานและผู้เยี่ยมชม
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-ink">
            <thead className="border-b border-line bg-paper/60 text-xs font-bold uppercase text-ink-soft">
              <tr>
                <th scope="col" className="px-4 py-3.5">ID / วันเวลา</th>
                <th scope="col" className="px-4 py-3.5">ผู้ใช้ / Visitor ID</th>
                <th scope="col" className="px-4 py-3.5">คุกกี้วิเคราะห์ (Analytics)</th>
                <th scope="col" className="px-4 py-3.5">คุกกี้การใช้งาน (Functional)</th>
                <th scope="col" className="px-4 py-3.5">คุกกี้การตลาด (Marketing)</th>
                <th scope="col" className="px-4 py-3.5">เวอร์ชันนโยบาย</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-ink-soft">
                    ยังไม่มีรายการบันทึกความยินยอมในระบบ
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-paper/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-ink">#{log.id}</span>
                      <p className="text-[11px] text-ink-soft mt-0.5">{log.created_at}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      {log.customer_name ? (
                        <div>
                          <span className="font-semibold text-ink">{log.customer_name}</span>
                          <span className="text-xs text-brand font-mono block">User #{log.user_id}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-ink-soft">ผู้เยี่ยมชมทั่วไป (Guest)</span>
                      )}
                      <p className="text-[11px] font-mono text-ink-soft truncate max-w-[140px]" title={log.visitor_id}>
                        {log.visitor_id}
                      </p>
                    </td>

                    <td className="px-4 py-3.5">
                      {log.analytics === 1 ? (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                          ✓ ยินยอม
                        </span>
                      ) : (
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                          ✕ ปฏิเสธ
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {log.functional === 1 ? (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                          ✓ ยินยอม
                        </span>
                      ) : (
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                          ✕ ปฏิเสธ
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {log.marketing === 1 ? (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                          ✓ ยินยอม
                        </span>
                      ) : (
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                          ✕ ปฏิเสธ
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-xs text-ink-soft">
                      v{log.policy_version}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
