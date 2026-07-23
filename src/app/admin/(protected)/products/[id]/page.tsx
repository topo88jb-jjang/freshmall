import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { Category, Product, ProductOption } from "@/lib/types";
import ProductForm from "../ProductForm";

export const revalidate = 0;

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const admin = supabaseAdmin();
  const [{ data: product }, { data: categories }, { data: options }] = await Promise.all([
    admin.from("products").select("*").eq("id", params.id).single<Product>(),
    admin.from("categories").select("*").order("sort_order").returns<Category[]>(),
    admin
      .from("product_options")
      .select("*")
      .eq("product_id", params.id)
      .order("sort_order")
      .returns<ProductOption[]>(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl mb-6 text-ink" style={{ fontFamily: "var(--font-display)" }}>
        상품 수정
      </h1>
      <ProductForm categories={categories ?? []} product={product} existingOptions={options ?? []} />
    </div>
  );
}
