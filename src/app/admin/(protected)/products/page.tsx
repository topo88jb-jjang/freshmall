import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { Product, formatWon } from "@/lib/types";
import ProductRowActions from "./ProductRowActions";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const admin = supabaseAdmin();
  const { data: products } = await admin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Product[]>();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl text-ink" style={{ fontFamily: "var(--font-display)" }}>
          상품 관리
        </h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 rounded-md bg-tomato text-cream text-sm hover:bg-ink"
        >
          + 새 상품 등록
        </Link>
      </div>

      <div className="border border-ink/10 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone/30 text-ink/50 text-xs">
            <tr>
              <th className="text-left px-4 py-2 font-normal">상품명</th>
              <th className="text-left px-4 py-2 font-normal">가격</th>
              <th className="text-left px-4 py-2 font-normal">재고</th>
              <th className="text-left px-4 py-2 font-normal">상태</th>
              <th className="text-right px-4 py-2 font-normal">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {(products ?? []).map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3 price-display">
                  {formatWon(p.discount_price ?? p.price)}
                </td>
                <td className="px-4 py-3 price-display">{p.stock}</td>
                <td className="px-4 py-3">
                  <span className={p.is_active ? "text-moss" : "text-ink/30"}>
                    {p.is_active ? "판매중" : "숨김"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ProductRowActions product={p} />
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink/40">
                  등록된 상품이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
