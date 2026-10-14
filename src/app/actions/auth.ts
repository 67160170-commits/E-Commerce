"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearSessionCookie, loginUser, registerUser, setSessionCookie } from "@/lib/auth";

export type AuthState = {
  error?: string;
  success?: boolean;
};

export async function loginAction(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const email = (formData.get("email") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";
  const redirectTo = (formData.get("redirect") as string) || "/";

  try {
    const user = await loginUser(email, password);
    await setSessionCookie(user.id);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
    };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo.startsWith("/") ? redirectTo : "/");
}

export async function registerAction(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const name = (formData.get("name") as string) ?? "";
  const email = (formData.get("email") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";
  const redirectTo = (formData.get("redirect") as string) || "/";

  if (password !== confirmPassword) {
    return { error: "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน" };
  }

  try {
    const user = await registerUser(name, email, password);
    await setSessionCookie(user.id);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการสมัครสมาชิก",
    };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo.startsWith("/") ? redirectTo : "/");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  revalidatePath("/", "layout");
  redirect("/");
}
