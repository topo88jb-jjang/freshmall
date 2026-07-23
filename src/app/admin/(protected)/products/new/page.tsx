import { supabaseAdmin } from "@/lib/supabase";
import { Category } from "@/lib/types";
import ProductForm from "../ProductForm";

export const revalidate = 0;

export default async function NewProductPage() {
  const admin = supabaseAdmin();
  const { data: categories } = await admin
    .from("categories")
    .select("*")
    .order("sort_order")
    .returns<Category[]>();

  return (
    <div>
      <h1 className="text-2xl mb-6 text-ink" style={{ fontFamily: "var(--font-display)" }}>
        새 상품 등록
      </h1>
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
