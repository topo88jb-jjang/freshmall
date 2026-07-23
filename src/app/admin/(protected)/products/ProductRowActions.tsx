"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Product } from "@/lib/types";
import { deleteProduct, toggleProductActive } from "./actions";

export default function ProductRowActions({ product }: { product: Product }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex justify-end gap-3 text-xs">
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await toggleProductActive(product.id, !product.is_active);
          router.refresh();
          setBusy(false);
        }}
        className="text-ink/50 hover:text-forest underline underline-offset-2"
      >
        {product.is_active ? "숨기기" : "노출하기"}
      </button>
      <Link
        href={`/admin/products/${product.id}`}
        className="text-ink/50 hover:text-forest underline underline-offset-2"
      >
        수정
      </Link>
      <button
        disabled={busy}
        onClick={async () => {
          if (!confirm(`'${product.name}' 상품을 삭제할까요?`)) return;
          setBusy(true);
          await deleteProduct(product.id);
          router.refresh();
          setBusy(false);
        }}
        className="text-ink/50 hover:text-tomato underline underline-offset-2"
      >
        삭제
      </button>
    </div>
  );
}
