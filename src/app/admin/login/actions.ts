"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkAdminPassword, ADMIN_COOKIE } from "@/lib/auth";

export async function loginAdmin(password: string) {
  if (!checkAdminPassword(password)) {
    return { success: false as const, message: "비밀번호가 올바르지 않습니다." };
  }
  const secret = process.env.ADMIN_SESSION_SECRET!;
  cookies().set(ADMIN_COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8시간
  });
  return { success: true as const };
}

export async function logoutAdmin() {
  cookies().delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
