"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminAuthed } from "@/lib/auth";

function assertAuthed() {
  if (!isAdminAuthed()) throw new Error("관리자 인증이 필요합니다.");
}

function slugify(name: string) {
  // 한글이 URL에 그대로 들어가면 기기/브라우저별 유니코드 정규화 차이(NFC/NFD)로
  // 상품 상세페이지가 404로 뜨는 문제가 생길 수 있어, 주소는 영문+숫자 조합만 사용합니다.
  return "p-" + randomUUID().replace(/-/g, "").slice(0, 12);
}

export type ProductOptionInput = {
  label: string;
  price: number;
  stock: number;
};

export type ProductFormInput = {
  name: string;
  categoryId: string;
  description: string;
  origin: string;
  unitLabel: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  imageUrl: string;
  detailImageUrls: string[];
  isActive: boolean;
  isFeatured: boolean;
  options: ProductOptionInput[]; // 비어있으면 "단품" 상품 (옵션 선택 없이 기본 가격/재고 사용)
};

const MAX_OPTIONS = 12;

async function saveOptions(admin: ReturnType<typeof supabaseAdmin>, productId: string, options: ProductOptionInput[]) {
  // 기존 옵션 전체 삭제 후 새로 저장 (최대 12개까지만)
  const { error: delError } = await admin.from("product_options").delete().eq("product_id", productId);
  if (delError) throw new Error("옵션 저장에 실패했습니다: " + delError.message);

  const trimmed = options.filter((o) => o.label.trim()).slice(0, MAX_OPTIONS);
  if (trimmed.length === 0) return;

  const payload = trimmed.map((o, idx) => ({
    product_id: productId,
    label: o.label.trim(),
    price: o.price,
    stock: o.stock,
    sort_order: idx,
  }));

  const { error } = await admin.from("product_options").insert(payload);
  if (error) throw new Error("옵션 저장에 실패했습니다: " + error.message);
}

export async function createProduct(input: ProductFormInput) {
  assertAuthed();
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("products")
    .insert({
      category_id: input.categoryId || null,
      name: input.name,
      slug: slugify(input.name),
      description: input.description,
      origin: input.origin,
      unit_label: input.unitLabel,
      price: input.price,
      discount_price: input.discountPrice,
      stock: input.stock,
      image_url: input.imageUrl,
      detail_image_urls: input.detailImageUrls,
      is_active: input.isActive,
      is_featured: input.isFeatured,
    })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "상품 저장에 실패했습니다.");

  await saveOptions(admin, data.id, input.options);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, input: ProductFormInput) {
  assertAuthed();
  const admin = supabaseAdmin();
  const { error } = await admin
    .from("products")
    .update({
      category_id: input.categoryId || null,
      name: input.name,
      description: input.description,
      origin: input.origin,
      unit_label: input.unitLabel,
      price: input.price,
      discount_price: input.discountPrice,
      stock: input.stock,
      image_url: input.imageUrl,
      detail_image_urls: input.detailImageUrls,
      is_active: input.isActive,
      is_featured: input.isFeatured,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await saveOptions(admin, id, input.options);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  assertAuthed();
  const admin = supabaseAdmin();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function toggleProductActive(id: string, next: boolean) {
  assertAuthed();
  const admin = supabaseAdmin();
  const { error } = await admin.from("products").update({ is_active: next }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/products");
}
