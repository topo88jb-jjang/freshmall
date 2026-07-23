import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { logoutAdmin } from "../login/actions";

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAdminAuthed()) {
    redirect("/admin/login");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-[180px_1fr] gap-8">
      <aside className="space-y-1">
        <p className="text-xs text-ink/40 mb-3 px-3">FRESHMALL ADMIN</p>
        <AdminNavLink href="/admin">대시보드</AdminNavLink>
        <AdminNavLink href="/admin/products">상품 관리</AdminNavLink>
        <AdminNavLink href="/admin/orders">주문 관리</AdminNavLink>
        <form action={logoutAdmin}>
          <button className="w-full text-left px-3 py-2 text-sm rounded-md text-ink/50 hover:bg-stone/40">
            로그아웃
          </button>
        </form>
      </aside>
      <div>{children}</div>
    </div>
  );
}

function AdminNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block px-3 py-2 text-sm rounded-md text-ink/70 hover:bg-stone/40 hover:text-ink">
      {children}
    </Link>
  );
}
