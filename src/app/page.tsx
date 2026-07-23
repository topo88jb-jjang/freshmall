import Image from "next/image";
import Link from "next/link";
import { supabasePublic } from "@/lib/supabase";
import { Category, Product, ProductOption } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export const revalidate = 0;

export default async function HomePage() {
  const [{ data: featured }, { data: categories }, { data: activeProducts }] =
    await Promise.all([
      supabasePublic
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(8),
      supabasePublic.from("categories").select("*").order("sort_order"),
      supabasePublic
        .from("products")
        .select("category_id, image_url")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
    ]);

  const featuredIds = (featured ?? []).map((p: Product) => p.id);
  const { data: featuredOptions } = featuredIds.length
    ? await supabasePublic
        .from("product_options")
        .select("*")
        .in("product_id", featuredIds)
        .order("sort_order")
        .returns<ProductOption[]>()
    : { data: [] as ProductOption[] };

  const optionsByProduct = new Map<string, ProductOption[]>();
  for (const o of featuredOptions ?? []) {
    const list = optionsByProduct.get(o.product_id) ?? [];
    list.push(o);
    optionsByProduct.set(o.product_id, list);
  }

  // 카테고리별 대표 이미지: 해당 카테고리의 가장 최근 등록된 판매중 상품 사진을 사용합니다.
  const categoryThumbnail = new Map<string, string>();
  for (const p of activeProducts ?? []) {
    if (p.category_id && p.image_url && !categoryThumbnail.has(p.category_id)) {
      categoryThumbnail.set(p.category_id, p.image_url);
    }
  }

  return (
    <div>
      <section className="border-b border-ink/10 bg-cream">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="stamp text-tomato mb-6">오늘 새벽 수확 · 당일 발송</span>
            <h1
              className="mt-5 text-4xl md:text-5xl leading-[1.15] text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              밭에서 식탁까지,
              <br />
              <span className="italic text-moss">가장 짧은 거리</span>로.
            </h1>
            <p className="mt-5 text-ink/60 leading-relaxed">
              전국 산지 농가와 직접 연결해 유통 단계를 줄였습니다. 주문 당일 상품
              포장하여 발송되며 수확한 그대로의 신선함을 받아보세요.
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                href="/products"
                className="px-6 py-3 rounded-md bg-forest text-cream text-sm hover:bg-ink transition-colors"
              >
                전체 상품 보기
              </Link>
              <Link
                href="/orders/lookup"
                className="px-6 py-3 rounded-md border border-ink/15 text-sm hover:border-ink"
              >
                내 주문 조회
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(categories ?? []).slice(0, 4).map((c: Category) => {
              const thumb = categoryThumbnail.get(c.id);
              return (
                <Link
                  key={c.id}
                  href={`/products?category=${c.slug}`}
                  className="relative aspect-square rounded-md overflow-hidden border border-ink/10 group"
                >
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={c.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/60" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/0 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-cream text-sm font-medium drop-shadow">
                    {c.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl text-ink" style={{ fontFamily: "var(--font-display)" }}>
            오늘의 추천
          </h2>
          <Link href="/products" className="text-sm text-ink/50 hover:text-tomato">
            더보기 →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
          {(featured ?? []).map((p: Product) => (
            <ProductCard key={p.id} product={p} options={optionsByProduct.get(p.id) ?? []} />
          ))}
          {(!featured || featured.length === 0) && (
            <p className="col-span-full text-ink/40 text-sm">
              등록된 추천 상품이 없습니다. 관리자 페이지에서 상품을 등록해보세요.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
