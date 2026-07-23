import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { formatWon, Order, OrderItem } from "@/lib/types";

export const revalidate = 0;

export default async function OrderCompletePage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const admin = supabaseAdmin();
  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("order_number", params.orderNumber)
    .single<Order>();

  if (!order) notFound();

  const { data: items } = await admin
    .from("order_items")
    .select("*")
    .eq("order_id", order.id)
    .returns<OrderItem[]>();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center">
        <span className="stamp text-moss">접수 완료</span>
        <h1
          className="mt-5 text-3xl text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          주문이 접수되었습니다
        </h1>
        <p className="mt-3 text-ink/50">
          주문번호 <span className="text-ink price-display">{order.order_number}</span>
        </p>
      </div>

      <div className="mt-10 border border-ink/10 rounded-md divide-y divide-ink/10">
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
          <span className="price-display" style={{ fontFamily: "var(--font-display)" }}>
            {formatWon(order.total_amount)}
          </span>
        </div>
      </div>

      <div className="mt-6 bg-stone/30 rounded-md p-5 text-sm text-ink/70 leading-relaxed">
        <p className="text-ink mb-1 font-medium">입금 계좌 안내</p>
        입금 은행 000은행 000-0000-000000 (예금주 프레시마켓)
        <br />
        입금 확인 후 순차적으로 배송이 시작되며, 진행 상황은 [주문조회] 메뉴에서
        주문번호와 연락처로 확인하실 수 있습니다.
      </div>

      <div className="mt-8 flex gap-3 justify-center">
        <Link href="/products" className="px-6 py-3 rounded-md border border-ink/15 text-sm hover:border-ink">
          쇼핑 계속하기
        </Link>
        <Link href="/orders/lookup" className="px-6 py-3 rounded-md bg-forest text-cream text-sm hover:bg-ink">
          주문 조회하기
        </Link>
      </div>
    </div>
  );
}
