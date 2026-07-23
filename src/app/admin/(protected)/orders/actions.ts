"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminAuthed } from "@/lib/auth";
import { OrderStatus } from "@/lib/types";

export async function updateOrderStatus(id: string, status: OrderStatus) {
  if (!isAdminAuthed()) throw new Error("관리자 인증이 필요합니다.");
  const admin = supabaseAdmin();
  const { error } = await admin.from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
