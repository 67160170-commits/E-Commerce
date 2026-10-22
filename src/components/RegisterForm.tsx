"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthState } from "@/app/actions/auth";

export default function RegisterForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, isPending] = useActionState<AuthState | null, FormData>(
    registerAction,
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
        <label htmlFor="name" className="block text-sm font-medium text-ink">
          ชื่อ-นามสกุล
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="สมชาย ใจดี"
          className="mt-1 block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand focus:outline-none"
        />
      </div>

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
          รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="••••••••"
          className="mt-1 block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink">
          ยืนยันรหัสผ่าน
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="••••••••"
          className="mt-1 block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-brand focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        id="submit-register-btn"
        className="w-full rounded-xl bg-brand py-3 font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep disabled:opacity-60"
      >
        {isPending ? "กำลังสมัครสมาชิก..." : "สร้างบัญชีผู้ใช้"}
      </button>

      <p className="text-center text-sm text-ink-soft">
        มีบัญชีอยู่แล้ว?{" "}
        <Link
          href={`/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
          className="font-medium text-brand hover:underline"
        >
          เข้าสู่ระบบ
        </Link>
      </p>
    </form>
  );
}
