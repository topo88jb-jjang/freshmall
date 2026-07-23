"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { Order, OrderItem } from "@/lib/types";

export async function lookupOrdersByPhone(phone: string) {
  const normalized = phone.replace(/-/g, "").trim();
  if (!normalized) return { orders: [] as (Order & { items: OrderItem[] })[] };

  const admin = supabaseAdmin();
  const { data: orders } = await admin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Order[]>();

  const matched = (orders ?? []).filter(
    (o) => o.phone.replace(/-/g, "") === normalized
  );

  if (matched.length === 0) return { orders: [] as (Order & { items: OrderItem[] })[] };

  const { data: allItems } = await admin
    .from("order_items")
    .select("*")
    .in(
      "order_id",
      matched.map((o) => o.id)
    )
    .returns<OrderItem[]>();

  const result = matched.map((o) => ({
    ...o,
    items: (allItems ?? []).filter((i) => i.order_id === o.id),
  }));

  return { orders: result };
}
