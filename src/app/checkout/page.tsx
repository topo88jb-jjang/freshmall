"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatWon } from "@/lib/types";
import { createOrder } from "./actions";

export default function CheckoutPage() {
  const { items, totalPrice, clear } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    zipcode: "",
    address: "",
    addressDetail: "",
    requestNote: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    setErrorMsg("");
    try {
      const result = await createOrder({ ...form, items });
      clear();
      router.push(`/order-complete/${result.orderNumber}`);
    } catch (err: any) {
      setErrorMsg(err.message ?? "주문 처리 중 오류가 발생했습니다.");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center text-ink/50">
        장바구니가 비어 있습니다.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl mb-8 text-ink" style={{ fontFamily: "var(--font-display)" }}>
        주문서 작성
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section>
          <h2 className="text-sm text-ink/50 mb-3">주문 상품</h2>
          <div className="border border-ink/10 rounded-md divide-y divide-ink/10">
            {items.map((i) => (
              <div key={i.productId} className="flex justify-between px-4 py-3 text-sm">
                <span className="text-ink/80">
                  {i.name} <span className="text-ink/40">× {i.quantity}</span>
                </span>
                <span className="price-display">{formatWon(i.price * i.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between px-4 py-3 font-medium">
              <span>총 결제 금액</span>
              <span className="price-display" style={{ fontFamily: "var(--font-display)" }}>
                {formatWon(totalPrice)}
              </span>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm text-ink/50">배송 정보</h2>
          <Field label="받는 분 이름 *">
            <input required value={form.customerName} onChange={update("customerName")} className="input" />
          </Field>
          <Field label="연락처 *">
            <input required placeholder="010-0000-0000" value={form.phone} onChange={update("phone")} className="input" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="우편번호" className="col-span-1">
              <input value={form.zipcode} onChange={update("zipcode")} className="input" />
            </Field>
            <Field label="주소 *" className="col-span-2">
              <input required value={form.address} onChange={update("address")} className="input" />
            </Field>
          </div>
          <Field label="상세 주소">
            <input value={form.addressDetail} onChange={update("addressDetail")} className="input" />
          </Field>
          <Field label="배송 요청사항">
            <textarea
              value={form.requestNote}
              onChange={update("requestNote")}
              rows={3}
              className="input resize-none"
              placeholder="예: 부재시 경비실에 맡겨주세요"
            />
          </Field>
        </section>

        <section className="bg-stone/30 rounded-md p-4 text-sm text-ink/60 leading-relaxed">
          본 사이트는 PG 결제 연동 없이 주문 정보만 접수합니다. 주문 완료 후 안내되는
          계좌로 입금해주시면, 관리자가 확인 후 순차적으로 배송을 진행합니다.
        </section>

        {errorMsg && <p className="text-tomato text-sm">{errorMsg}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-md bg-tomato text-cream hover:bg-ink transition-colors disabled:opacity-50"
        >
          {submitting ? "주문 처리 중..." : `${formatWon(totalPrice)} 주문 완료하기`}
        </button>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid rgba(31, 42, 29, 0.15);
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 14px;
          background: white;
        }
        .input:focus {
          outline: 2px solid #e4572e;
          outline-offset: 1px;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="block text-xs text-ink/50 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
