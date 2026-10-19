"use client";

import { useEffect, useSyncExternalStore, useState, useTransition } from "react";
import Link from "next/link";
import { saveConsentAction } from "@/app/actions/consent";

const POLICY_VERSION = "1.0";
const CONSENT_STORAGE_KEY = "vitashop_cookie_consent";
const VISITOR_ID_KEY = "vitashop_visitor_id";

type ConsentData = {
  version: string;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
  timestamp: string;
};

function subscribe(callback: () => void) {
  window.addEventListener("vitashop:consent-updated", callback);
  window.addEventListener("vitashop:open-cookie-settings", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("vitashop:consent-updated", callback);
    window.removeEventListener("vitashop:open-cookie-settings", callback);
    window.removeEventListener("storage", callback);
  };
}

function getConsentSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CONSENT_STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  let vid = localStorage.getItem(VISITOR_ID_KEY);
  if (!vid) {
    vid = "v_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem(VISITOR_ID_KEY, vid);
  }
  return vid;
}

export default function CookieConsentBanner() {
  const rawConsent = useSyncExternalStore(subscribe, getConsentSnapshot, getServerSnapshot);
  const [manualOpen, setManualOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  const [analytics, setAnalytics] = useState(false);
  const [functional, setFunctional] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const handleOpen = () => {
      setManualOpen(true);
      setShowPreferences(true);
    };
    window.addEventListener("vitashop:open-cookie-settings", handleOpen);
    return () => {
      window.removeEventListener("vitashop:open-cookie-settings", handleOpen);
    };
  }, []);

  let parsedConsent: ConsentData | null = null;
  if (rawConsent) {
    try {
      parsedConsent = JSON.parse(rawConsent);
    } catch {
      parsedConsent = null;
    }
  }

  // แบนเนอร์จะแสดงเมื่อยังไม่มีค่าความยินยอม หรือเวอร์ชันนโยบายเปลี่ยน หรือผู้ใช้เปิดเอง
  const needsConsent = !parsedConsent || parsedConsent.version !== POLICY_VERSION;
  const isVisible = needsConsent || manualOpen;

  const saveConsent = (allowAnalytics: boolean, allowFunctional: boolean, allowMarketing: boolean) => {
    const visitorId = getOrCreateVisitorId();
    const consentPayload: ConsentData = {
      version: POLICY_VERSION,
      analytics: allowAnalytics,
      functional: allowFunctional,
      marketing: allowMarketing,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentPayload));
    } catch {
      // Ignore
    }

    window.dispatchEvent(
      new CustomEvent("vitashop:consent-updated", { detail: consentPayload })
    );

    startTransition(async () => {
      await saveConsentAction({
        visitorId,
        analytics: allowAnalytics,
        functional: allowFunctional,
        marketing: allowMarketing,
        policyVersion: POLICY_VERSION,
      });
    });

    setManualOpen(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    setAnalytics(true);
    setFunctional(true);
    setMarketing(true);
    saveConsent(true, true, true);
  };

  const handleRejectNonNecessary = () => {
    setAnalytics(false);
    setFunctional(false);
    setMarketing(false);
    saveConsent(false, false, false);
  };

  const handleSavePreferences = () => {
    saveConsent(analytics, functional, marketing);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="การขอความยินยอมการใช้งานคุกกี้"
      className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-line bg-white/98 p-5 sm:p-6 shadow-2xl backdrop-blur-md">
        {/* ข้อความหลัก */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍪</span>
            <h3 className="text-base sm:text-lg font-bold text-ink">
              นโยบายการใช้คุกกี้และความเป็นส่วนตัว (PDPA)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
            เว็บไซต์ VitaShop มีการใช้งานคุกกี้เพื่อความจำเป็นในการทำงานของระบบ (เช่น การเข้าสู่ระบบ และการสั่งซื้อสินค้า)
            รวมถึงคุกกี้เพื่อพัฒนาประสบการณ์และบริการ หากคุณยินยอม{" "}
            <Link
              href="/cookie-policy"
              className="font-semibold text-brand underline hover:text-brand-deep"
            >
              อ่านนโยบายคุกกี้ฉบับเต็ม
            </Link>
          </p>
        </div>

        {/* แผงตั้งค่าแยกประเภทคุกกี้ (แบบละเอียด) */}
        {showPreferences && (
          <div className="mt-4 space-y-3 border-t border-line pt-4 text-xs">
            {/* คุกกี้ที่จำเป็น */}
            <div className="flex items-start justify-between rounded-xl bg-paper p-3">
              <div className="pr-4">
                <span className="font-bold text-ink block">คุกกี้ที่จำเป็นอย่างยิ่ง (Strictly Necessary)</span>
                <p className="text-[11px] text-ink-soft mt-0.5">
                  จำเป็นสำหรับการทำงานพื้นฐาน เช่น Session ล็อกอิน และตะกร้าสินค้า (เปิดตลอดเวลา)
                </p>
              </div>
              <span className="rounded bg-brand px-2 py-0.5 text-[11px] font-bold text-white shrink-0">
                เปิดใช้งานเสมอ
              </span>
            </div>

            {/* คุกกี้เพื่อการวิเคราะห์ */}
            <div className="flex items-start justify-between rounded-xl border border-line bg-white p-3">
              <div className="pr-4">
                <span className="font-bold text-ink block">คุกกี้เพื่อการวิเคราะห์ (Analytics)</span>
                <p className="text-[11px] text-ink-soft mt-0.5">
                  ช่วยวัดผลการเข้าชมและสถิติสินค้า เพื่อพัฒนาการทำงานของเว็บไซต์
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="rounded border-line text-brand focus:ring-brand h-4 w-4"
                />
              </label>
            </div>

            {/* คุกกี้เพื่อการใช้งาน */}
            <div className="flex items-start justify-between rounded-xl border border-line bg-white p-3">
              <div className="pr-4">
                <span className="font-bold text-ink block">คุกกี้เพื่อการทำงานและฟังก์ชัน (Functional)</span>
                <p className="text-[11px] text-ink-soft mt-0.5">
                  ช่วยจดจำการตั้งค่าและตัวเลือกการแสดงผลของคุณ
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={functional}
                  onChange={(e) => setFunctional(e.target.checked)}
                  className="rounded border-line text-brand focus:ring-brand h-4 w-4"
                />
              </label>
            </div>

            {/* คุกกี้การตลาด */}
            <div className="flex items-start justify-between rounded-xl border border-line bg-white p-3">
              <div className="pr-4">
                <span className="font-bold text-ink block">คุกกี้เพื่อการตลาด (Marketing)</span>
                <p className="text-[11px] text-ink-soft mt-0.5">
                  นำเสนอสิทธิพิเศษและโปรโมชันที่เหมาะกับความสนใจของคุณ
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="rounded border-line text-brand focus:ring-brand h-4 w-4"
                />
              </label>
            </div>
          </div>
        )}

        {/* ปุ่มการกระทำ 3 ปุ่มหลักตามมาตรฐาน PDPA */}
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-line/60 pt-3">
          {showPreferences ? (
            <>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="rounded-xl border border-line px-3.5 py-2 text-xs font-semibold text-ink-soft hover:bg-gray-100"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                id="cookie-save-preferences-btn"
                className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-deep"
              >
                บันทึกการตั้งค่า
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                id="cookie-customize-btn"
                className="rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink hover:border-brand hover:text-brand"
              >
                ⚙ ตั้งค่าคุกกี้
              </button>
              <button
                type="button"
                onClick={handleRejectNonNecessary}
                id="cookie-reject-btn"
                className="rounded-xl border border-line bg-paper px-3.5 py-2 text-xs font-semibold text-ink hover:border-red-300 hover:text-red-700"
              >
                ปฏิเสธที่ไม่จำเป็น
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                id="cookie-accept-all-btn"
                className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-deep"
              >
                ยอมรับทั้งหมด
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
