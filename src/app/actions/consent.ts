"use server";

import { getCurrentUser } from "@/lib/auth";
import { logConsent } from "@/lib/admin";

export async function saveConsentAction(data: {
  visitorId: string;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
  policyVersion: string;
}) {
  try {
    const user = await getCurrentUser();
    logConsent({
      visitorId: data.visitorId,
      userId: user?.id ?? null,
      analytics: data.analytics,
      functional: data.functional,
      marketing: data.marketing,
      policyVersion: data.policyVersion,
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "ไม่สามารถบันทึกความยินยอมได้",
    };
  }
}
