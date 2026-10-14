"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthState } from "@/app/actions/auth";

export default function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, isPending] = useActionState<AuthState | null, FormData>(
    loginAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo || "/"} />

      {state?.error && (
        <div className="rounded-lg bg-red-50 p-3.5 text-sm font-medium text-red-700 border border-red-200">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink">
          อีเมล
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          autoComplete="email"
          placeholder="example@email.com"
          className="mt-1 block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-ink">
          รหัสผ่าน
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="mt-1 block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        id="submit-login-btn"
        className="w-full rounded-xl bg-brand py-3 font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep disabled:opacity-60"
      >
        {isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>

      <div className="rounded-xl border border-line bg-paper p-3 text-xs text-ink-soft">
        <p className="font-semibold text-ink mb-1">บัญชีสำหรับทดสอบระบบ:</p>
        <p>• ลูกค้า: <code className="text-brand">customer@vitashop.com</code> / รหัสผ่าน: <code className="text-brand">123456</code></p>
        <p>• แอดมิน: <code className="text-brand">admin@vitashop.com</code> / รหัสผ่าน: <code className="text-brand">123456</code></p>
      </div>

      <p className="text-center text-sm text-ink-soft">
        ยังไม่มีบัญชีผู้ใช้?{" "}
        <Link
          href={`/register${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
          className="font-medium text-brand hover:underline"
        >
          สมัครสมาชิกที่นี่
        </Link>
      </p>
    </form>
  );
}
