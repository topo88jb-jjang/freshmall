"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Product, formatWon } from "@/lib/types";
import { useCart } from "@/context/CartContext";

export default function AddToCartBox({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const finalPrice = product.discount_price ?? product.price;
  const soldOut = product.stock <= 0;

  const item = {
    productId: product.id,
    name: product.name,
    price: finalPrice,
    unitLabel: product.unit_label,
    imageUrl: product.image_url,
    quantity: qty,
    stock: product.stock,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-sm text-ink/60">수량</span>
        <div className="flex items-center border border-ink/15 rounded-md">
          <button
            className="w-9 h-9 flex items-center justify-center text-ink/60 hover:text-tomato disabled:opacity-30"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
          >
            −
          </button>
          <span className="w-10 text-center price-display">{qty}</span>
          <button
            className="w-9 h-9 flex items-center justify-center text-ink/60 hover:text-tomato disabled:opacity-30"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            disabled={qty >= product.stock}
          >
            +
          </button>
        </div>
        <span className="text-ink/40 text-sm">재고 {product.stock}{product.unit_label.match(/\d/) ? "개" : ""}</span>
      </div>

      <div className="flex items-baseline justify-between border-t border-ink/10 pt-4">
        <span className="text-sm text-ink/60">총 금액</span>
        <span
          className="price-display text-2xl text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {formatWon(finalPrice * qty)}
        </span>
      </div>

      <div className="flex gap-3">
        <button
          disabled={soldOut}
          onClick={() => addItem(item)}
          className="flex-1 py-3 rounded-md border border-forest text-forest hover:bg-forest hover:text-cream transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          장바구니 담기
        </button>
        <button
          disabled={soldOut}
          onClick={() => {
            addItem(item);
            router.push("/cart");
          }}
          className="flex-1 py-3 rounded-md bg-tomato text-cream hover:bg-ink transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          바로 주문하기
        </button>
      </div>
    </div>
  );
}
