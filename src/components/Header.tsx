"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

const NAV = [
  { label: "전체상품", href: "/products" },
  { label: "채소", href: "/products?category=vegetables" },
  { label: "과일", href: "/products?category=fruits" },
  { label: "정육", href: "/products?category=meat" },
  { label: "간편식", href: "/products?category=sidedish" },
];

export default function Header() {
  const { totalCount } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="stamp text-forest font-semibold">FM · 산지직송</span>
            <span
              className="text-2xl text-ink"
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
            >
              프레시마켓
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="text-ink/80 hover:text-tomato transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 text-sm">
            <Link href="/orders/lookup" className="text-ink/70 hover:text-tomato hidden sm:inline">
              주문조회
            </Link>
            <Link
              href="/cart"
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-ink/15 hover:border-tomato hover:text-tomato transition-colors"
              aria-label="장바구니"
            >
              <CartIcon />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-tomato text-cream text-[11px] leading-none rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {totalCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <nav className="flex md:hidden items-center gap-4 overflow-x-auto pb-3 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-ink/80 whitespace-nowrap hover:text-tomato"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="21" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17" cy="21" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
