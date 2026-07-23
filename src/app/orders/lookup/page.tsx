"use client";

import { useState } from "react";
import { formatWon, Order, OrderItem, ORDER_STATUS_LABEL, OrderStatus } from "@/lib/types";
import { lookupOrdersByPhone } from "./actions";

type OrderWithItems = Order & { items: OrderItem[] };

export default function OrderLookupPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<OrderWithItems[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(false);
    const res = await lookupOrdersByPhone(phone);
    setOrders(res.orders);
    setOpenId(res.orders[0]?.id ?? null);
    setSearched(true);
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-14">
      <h1 className="text-2xl mb-2 text-ink" style={{ fontFamily: "var(--font-display)" }}>
        주문 조회
      </h1>
      <p className="text-sm text-ink/50 mb-8">
        주문 시 입력한 연락처만 입력하면, 그 번호로 주문하신 내역을 모두 보여드려요.
        주문번호를 따로 기억하지 않으셔도 됩니다.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          placeholder="연락처 (예: 010-0000-0000)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-ink/15 rounded-md px-3 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-md bg-forest text-cream hover:bg-ink disabled:opacity-50"
        >
          {loading ? "조회 중..." : "조회하기"}
        </button>
      </form>

      {searched && orders && orders.length === 0 && (
        <p className="mt-6 text-sm text-tomato">
          이 연락처로 주문하신 내역을 찾을 수 없습니다. 입력하신 번호를 다시 확인해주세요.
        </p>
      )}

      {orders && orders.length > 0 && (
        <div className="mt-10 space-y-3">
          <p className="text-sm text-ink/50">총 {orders.length}건의 주문이 있어요</p>
          {orders.map((o) => (
            <div key={o.id} className="border border-ink/10 rounded-md overflow-hidden">
              <button
                onClick={() => setOpenId(openId === o.id ? null : o.id)}
                className="w-full px-4 py-3 flex justify-between items-center text-left"
              >
                <div>
                  <p className="price-display text-sm">{o.order_number}</p>
                  <p className="text-xs text-ink/40 mt-0.5">
                    {new Date(o.created_at).toLocaleString("ko-KR")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="stamp text-forest">
                    {ORDER_STATUS_LABEL[o.status as OrderStatus]}
                  </span>
                  <span className="price-display text-sm">{formatWon(o.total_amount)}</span>
                </div>
              </button>

              {openId === o.id && (
                <div className="border-t border-ink/10">
                  <div className="divide-y divide-ink/10">
                    {o.items.map((i) => (
                      <div key={i.id} className="flex justify-between px-4 py-3 text-sm">
                        <span>
                          {i.product_name} <span className="text-ink/40">× {i.quantity}</span>
                        </span>
                        <span className="price-display">{formatWon(i.price * i.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 text-xs text-ink/50 border-t border-ink/10">
                    배송지 {o.address} {o.address_detail}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
