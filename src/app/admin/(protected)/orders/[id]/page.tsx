import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { Order, OrderItem, formatWon } from "@/lib/types";
import StatusSelect from "../StatusSelect";

export const revalidate = 0;

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const admin = supabaseAdmin();
  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .single<Order>();

  if (!order) notFound();

  const { data: items } = await admin
    .from("order_items")
    .select("*")
    .eq("order_id", order.id)
    .returns<OrderItem[]>();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl mb-1 text-ink" style={{ fontFamily: "var(--font-display)" }}>
        주문 상세
      </h1>
      <p className="price-display text-ink/50 mb-6">{order.order_number}</p>

      <div className="mb-6">
        <StatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-6">
        <Info label="주문자" value={order.customer_name} />
        <Info label="연락처" value={order.phone} />
        <Info label="주소" value={`${order.address} ${order.address_detail}`} />
        <Info label="우편번호" value={order.zipcode || "-"} />
        <Info label="요청사항" value={order.request_note || "-"} />
        <Info label="주문일시" value={new Date(order.created_at).toLocaleString("ko-KR")} />
      </div>

      <h2 className="text-sm text-ink/50 mb-3">주문 상품</h2>
      <div className="border border-ink/10 rounded-md divide-y divide-ink/10">
        {(items ?? []).map((i) => (
          <div key={i.id} className="flex justify-between px-4 py-3 text-sm">
            <span>
              {i.product_name} <span className="text-ink/40">× {i.quantity}</span>
            </span>
            <span className="price-display">{formatWon(i.price * i.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between px-4 py-3 font-medium">
          <span>총 결제 금액</span>
          <span className="price-display">{formatWon(order.total_amount)}</span>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink/40">{label}</p>
      <p className="text-ink/80 mt-0.5">{value}</p>
    </div>
  );
}
