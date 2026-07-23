import Image from "next/image";
import { notFound } from "next/navigation";
import { supabasePublic } from "@/lib/supabase";
import { Product, ProductOption, formatWon } from "@/lib/types";
import AddToCartBox from "@/components/AddToCartBox";

export const revalidate = 0;

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: product } = await supabasePublic
    .from("products")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const p = product as Product;
  const hasDiscount = !!p.discount_price;

  const { data: options } = await supabasePublic
    .from("product_options")
    .select("*")
    .eq("product_id", p.id)
    .order("sort_order")
    .returns<ProductOption[]>();

  const hasOptions = (options ?? []).length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-12">
      <div className="relative aspect-square rounded-md overflow-hidden bg-stone/40">
        {p.image_url ? (
          <Image src={p.image_url} alt={p.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30">
            이미지 준비중
          </div>
        )}
      </div>

      <div>
        <span className="stamp text-moss">{p.origin || "산지 직송"}</span>
        <h1
          className="mt-4 text-3xl text-ink leading-snug"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {p.name}
        </h1>
        <p className="mt-2 text-ink/50 text-sm">{p.unit_label} 기준</p>

        {!hasOptions && (
          <div className="mt-5 flex items-baseline gap-3">
            {hasDiscount && (
              <span className="text-ink/40 line-through price-display">
                {formatWon(p.price)}
              </span>
            )}
            <span
              className="price-display text-3xl text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {formatWon(p.discount_price ?? p.price)}
            </span>
          </div>
        )}

        <p className="mt-6 text-ink/70 leading-relaxed whitespace-pre-line">
          {p.description}
        </p>

        <div className="mt-8">
          <AddToCartBox product={p} options={options ?? []} />
        </div>
      </div>

      {p.detail_image_urls && p.detail_image_urls.length > 0 && (
        <div className="md:col-span-2 space-y-4 pt-6 border-t border-ink/10">
          <h2 className="text-sm text-ink/50">상세 정보</h2>
          {p.detail_image_urls.map((url) => (
            <div key={url} className="relative w-full rounded-md overflow-hidden bg-stone/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${p.name} 상세 이미지`} className="w-full h-auto block" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
