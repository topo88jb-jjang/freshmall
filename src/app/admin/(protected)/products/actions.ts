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
};

export async function createProduct(input: ProductFormInput) {
  assertAuthed();
  const admin = supabaseAdmin();
  const { error } = await admin.from("products").insert({
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
  });
  if (error) throw new Error(error.message);
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
