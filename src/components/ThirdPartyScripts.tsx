"use client";

import { useSyncExternalStore } from "react";

const CONSENT_STORAGE_KEY = "vitashop_cookie_consent";

type ConsentData = {
  version: string;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
};

function subscribe(callback: () => void) {
  window.addEventListener("vitashop:consent-updated", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("vitashop:consent-updated", callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CONSENT_STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

export default function ThirdPartyScripts() {
  const rawConsent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!rawConsent) return null;

  let consent: ConsentData | null = null;
  try {
    consent = JSON.parse(rawConsent);
  } catch {
    return null;
  }

  if (!consent) return null;

  return (
    <>
      {consent.analytics && (
        <script
          id="vitashop-analytics-script"
          dangerouslySetInnerHTML={{
            __html: `/* VitaShop First-Party Analytics Activated with Consent */`,
          }}
        />
      )}
      {consent.marketing && (
        <script
          id="vitashop-marketing-script"
          dangerouslySetInnerHTML={{
            __html: `/* VitaShop Marketing Personalization Activated with Consent */`,
          }}
        />
      )}
    </>
  );
}
