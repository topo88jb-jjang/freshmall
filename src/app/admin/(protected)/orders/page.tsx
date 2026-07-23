import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { Order, ORDER_STATUS_LABEL, OrderStatus, formatWon } from "@/lib/types";

export const revalidate = 0;

const STATUSES: OrderStatus[] = ["pending", "paid", "preparing", "shipped", "done", "canceled"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const admin = supabaseAdmin();
  let query = admin.from("orders").select("*").order("created_at", { ascending: false });
  if (searchParams.status) query = query.eq("status", searchParams.status);
  const { data: orders } = await query.returns<Order[]>();

  return (
    <div>
      <h1 className="text-2xl mb-6 text-ink" style={{ fontFamily: "var(--font-display)" }}>
        주문 관리
      </h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/orders"
          className={`px-3 py-1 rounded-full text-xs border ${
            !searchParams.status ? "bg-forest text-cream border-forest" : "border-ink/15 text-ink/60"
          }`}
        >
          전체
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`px-3 py-1 rounded-full text-xs border ${
              searchParams.status === s
                ? "bg-forest text-cream border-forest"
                : "border-ink/15 text-ink/60"
            }`}
          >
            {ORDER_STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      <div className="border border-ink/10 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone/30 text-ink/50 text-xs">
            <tr>
              <th className="text-left px-4 py-2 font-normal">주문번호</th>
              <th className="text-left px-4 py-2 font-normal">주문자</th>
              <th className="text-left px-4 py-2 font-normal">금액</th>
              <th className="text-left px-4 py-2 font-normal">상태</th>
              <th className="text-left px-4 py-2 font-normal">주문일시</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {(orders ?? []).map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="price-display hover:text-tomato">
                    {o.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3">{o.customer_name}</td>
                <td className="px-4 py-3 price-display">{formatWon(o.total_amount)}</td>
                <td className="px-4 py-3">{ORDER_STATUS_LABEL[o.status]}</td>
                <td className="px-4 py-3 text-ink/40 text-xs">
                  {new Date(o.created_at).toLocaleString("ko-KR")}
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink/40">
                  주문이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
