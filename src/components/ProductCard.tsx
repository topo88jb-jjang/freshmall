"use client";

import Image from "next/image";
import Link from "next/link";
import { Product, ProductOption, formatWon } from "@/lib/types";
import { useCart } from "@/context/CartContext";

export default function ProductCard({
  product,
  options = [],
}: {
  product: Product;
  options?: ProductOption[];
}) {
  const { addItem } = useCart();
  const hasOptions = options.length > 0;
  const finalPrice = product.discount_price ?? product.price;
  const hasDiscount = !!product.discount_price;
  const soldOut = hasOptions
    ? options.every((o) => o.stock <= 0)
    : product.stock <= 0;
  const minOptionPrice = hasOptions ? Math.min(...options.map((o) => o.price)) : null;

  return (
    <div className="group flex flex-col">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden rounded-md bg-stone/40"
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30 text-sm">
            이미지 준비중
          </div>
        )}
        {product.is_featured && (
          <span className="stamp absolute top-3 left-3 bg-cream/90 text-forest">
            오늘의 추천
          </span>
        )}
        {soldOut && (
          <div className="absolute inset-0 bg-ink/50 flex items-center justify-center">
            <span className="text-cream text-sm tracking-wide">품절</span>
          </div>
        )}
      </Link>

      <div className="mt-3 space-y-1">
        <p className="text-xs text-moss">{product.origin}</p>
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="text-[15px] text-ink hover:text-tomato transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-ink/50">{product.unit_label}</p>

        <div className="flex items-baseline gap-2 pt-1">
          {hasOptions ? (
            <span
              className="price-display text-lg text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {formatWon(minOptionPrice!)}~
            </span>
          ) : (
            <>
              {hasDiscount && (
                <span className="text-xs text-ink/40 line-through price-display">
                  {formatWon(product.price)}
                </span>
              )}
              <span
                className="price-display text-lg text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {formatWon(finalPrice)}
              </span>
            </>
          )}
        </div>
      </div>

      {hasOptions ? (
        <Link
          href={`/products/${product.slug}`}
          className="mt-3 w-full py-2 text-sm rounded-md border border-ink/15 hover:border-forest hover:bg-forest hover:text-cream transition-colors text-center block"
        >
          옵션 선택하기
        </Link>
      ) : (
        <button
          disabled={soldOut}
          onClick={() =>
            addItem({
              productId: product.id,
              name: product.name,
              price: finalPrice,
              unitLabel: product.unit_label,
              imageUrl: product.image_url,
              quantity: 1,
              stock: product.stock,
              optionId: null,
              optionLabel: null,
            })
          }
          className="mt-3 w-full py-2 text-sm rounded-md border border-ink/15 hover:border-forest hover:bg-forest hover:text-cream transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          장바구니 담기
        </button>
      )}
    </div>
  );
}
