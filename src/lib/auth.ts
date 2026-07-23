import { cookies } from "next/headers";

export const ADMIN_COOKIE = "freshmall_admin_session";

export function isAdminAuthed(): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const cookieStore = cookies();
  const value = cookieStore.get(ADMIN_COOKIE)?.value;
  return !!value && value === secret;
}

export function checkAdminPassword(password: string): boolean {
  const real = process.env.ADMIN_PASSWORD;
  return !!real && password === real;
}
