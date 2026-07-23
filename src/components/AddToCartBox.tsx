"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Product, ProductOption, formatWon } from "@/lib/types";
import { useCart } from "@/context/CartContext";

export default function AddToCartBox({
  product,
  options,
}: {
  product: Product;
  options: ProductOption[];
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const hasOptions = options.length > 0;

  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    hasOptions ? options.find((o) => o.stock > 0)?.id ?? options[0].id : ""
  );
  const [qty, setQty] = useState(1);

  const selectedOption = hasOptions
    ? options.find((o) => o.id === selectedOptionId) ?? options[0]
    : null;

  const finalPrice = hasOptions ? selectedOption!.price : product.discount_price ?? product.price;
  const stock = hasOptions ? selectedOption!.stock : product.stock;
  const soldOut = stock <= 0;

  const item = useMemo(
    () => ({
      productId: product.id,
      name: product.name,
      price: finalPrice,
      unitLabel: hasOptions ? selectedOption!.label : product.unit_label,
      imageUrl: product.image_url,
      quantity: qty,
      stock,
      optionId: hasOptions ? selectedOption!.id : null,
      optionLabel: hasOptions ? selectedOption!.label : null,
    }),
    [product, finalPrice, qty, stock, hasOptions, selectedOption]
  );

  return (
    <div className="space-y-5">
      {hasOptions && (
        <div>
          <span className="block text-sm text-ink/60 mb-2">옵션 선택</span>
          <div className="space-y-2">
            {options.map((o) => {
              const optionSoldOut = o.stock <= 0;
              const selected = selectedOptionId === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  disabled={optionSoldOut}
                  onClick={() => {
                    setSelectedOptionId(o.id);
                    setQty(1);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-md border text-sm transition-colors disabled:opacity-40 disabled:pointer-events-none ${
                    selected
                      ? "border-forest bg-forest/5 text-ink"
                      : "border-ink/15 text-ink/70 hover:border-ink/30"
                  }`}
                >
                  <span>
                    {o.label}
                    {optionSoldOut && <span className="ml-2 text-tomato text-xs">품절</span>}
                  </span>
                  <span className="price-display">{formatWon(o.price)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
            onClick={() => setQty((q) => Math.min(stock, q + 1))}
            disabled={qty >= stock}
          >
            +
          </button>
        </div>
        <span className="text-ink/40 text-sm">재고 {stock}</span>
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
