"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatWon } from "@/lib/types";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, totalCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-ink/50">장바구니가 비어 있습니다.</p>
        <Link
          href="/products"
          className="inline-block mt-6 px-6 py-3 rounded-md bg-forest text-cream text-sm hover:bg-ink"
        >
          상품 보러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl mb-8 text-ink" style={{ fontFamily: "var(--font-display)" }}>
        장바구니 ({totalCount})
      </h1>

      <div className="divide-y divide-ink/10 border-y border-ink/10">
        {items.map((item) => (
          <div key={`${item.productId}-${item.optionId ?? "base"}`} className="py-5 flex gap-4 items-center">
            <div className="relative w-20 h-20 rounded-md overflow-hidden bg-stone/40 shrink-0">
              {item.imageUrl && (
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-ink truncate">{item.name}</p>
              <p className="text-xs text-ink/40 mt-1">
                {item.optionLabel ?? item.unitLabel}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center border border-ink/15 rounded-md">
                  <button
                    className="w-7 h-7 text-ink/60 hover:text-tomato"
                    onClick={() => updateQuantity(item.productId, item.optionId, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm price-display">{item.quantity}</span>
                  <button
                    className="w-7 h-7 text-ink/60 hover:text-tomato"
                    onClick={() => updateQuantity(item.productId, item.optionId, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.productId, item.optionId)}
                  className="text-xs text-ink/40 hover:text-tomato underline underline-offset-2"
                >
                  삭제
                </button>
              </div>
            </div>
            <span className="price-display text-ink shrink-0">
              {formatWon(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <span className="text-ink/60">총 결제 금액</span>
        <span
          className="price-display text-2xl text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {formatWon(totalPrice)}
        </span>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block text-center w-full py-3.5 rounded-md bg-tomato text-cream hover:bg-ink transition-colors"
      >
        주문하기
      </Link>
    </div>
  );
}
