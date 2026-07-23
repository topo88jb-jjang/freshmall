import { supabaseAdmin } from "@/lib/supabase";
import { formatWon, Order } from "@/lib/types";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const admin = supabaseAdmin();

  const [{ count: productCount }, { count: pendingCount }, { data: recentOrders }] =
    await Promise.all([
      admin.from("products").select("*", { count: "exact", head: true }),
      admin
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      admin
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8)
        .returns<Order[]>(),
    ]);

  const todayRevenue = (recentOrders ?? [])
    .filter((o) => o.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10))
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div>
      <h1 className="text-2xl mb-6 text-ink" style={{ fontFamily: "var(--font-display)" }}>
        대시보드
      </h1>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard label="등록 상품" value={`${productCount ?? 0}개`} />
        <StatCard label="입금대기 주문" value={`${pendingCount ?? 0}건`} accent />
        <StatCard label="오늘 매출(최근 주문 기준)" value={formatWon(todayRevenue)} />
      </div>

      <h2 className="text-sm text-ink/50 mb-3">최근 주문</h2>
      <div className="border border-ink/10 rounded-md divide-y divide-ink/10">
        {(recentOrders ?? []).map((o) => (
          <div key={o.id} className="flex justify-between px-4 py-3 text-sm">
            <span className="price-display">{o.order_number}</span>
            <span className="text-ink/60">{o.customer_name}</span>
            <span className="price-display">{formatWon(o.total_amount)}</span>
          </div>
        ))}
        {(!recentOrders || recentOrders.length === 0) && (
          <p className="px-4 py-6 text-sm text-ink/40">아직 주문이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-md border p-4 ${accent ? "border-tomato/40 bg-tomato/5" : "border-ink/10"}`}>
      <p className="text-xs text-ink/50">{label}</p>
      <p className="mt-2 text-xl price-display" style={{ fontFamily: "var(--font-display)" }}>
        {value}
      </p>
    </div>
  );
}
