import { supabasePublic } from "@/lib/supabase";
import { Category, Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export const revalidate = 0;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const activeSlug = searchParams.category;

  const { data: categories } = await supabasePublic
    .from("categories")
    .select("*")
    .order("sort_order");

  let query = supabasePublic
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (activeSlug) {
    const cat = (categories ?? []).find((c: Category) => c.slug === activeSlug);
    if (cat) query = query.eq("category_id", cat.id);
  }

  const { data: products } = await query;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl mb-6 text-ink" style={{ fontFamily: "var(--font-display)" }}>
        전체 상품
      </h1>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/products"
          className={`px-4 py-1.5 rounded-full text-sm border ${
            !activeSlug ? "bg-forest text-cream border-forest" : "border-ink/15 text-ink/70"
          }`}
        >
          전체
        </Link>
        {(categories ?? []).map((c: Category) => (
          <Link
            key={c.id}
            href={`/products?category=${c.slug}`}
            className={`px-4 py-1.5 rounded-full text-sm border ${
              activeSlug === c.slug
                ? "bg-forest text-cream border-forest"
                : "border-ink/15 text-ink/70"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
        {(products ?? []).map((p: Product) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {products && products.length === 0 && (
          <p className="col-span-full text-ink/40 text-sm">
            해당 카테고리에 판매중인 상품이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
