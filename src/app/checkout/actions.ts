"use server";

import { supabasePublic } from "@/lib/supabase";
import { generateOrderNumber } from "@/lib/order-number";
import { CartItem } from "@/lib/types";
import { randomUUID } from "crypto";
import { sendAdminOrderEmail } from "@/lib/notify";

type CreateOrderInput = {
  customerName: string;
  phone: string;
  zipcode: string;
  address: string;
  addressDetail: string;
  requestNote: string;
  items: CartItem[];
};

export async function createOrder(input: CreateOrderInput) {
  if (!input.items.length) {
    throw new Error("장바구니가 비어 있습니다.");
  }
  if (!input.customerName.trim() || !input.phone.trim() || !input.address.trim()) {
    throw new Error("이름, 연락처, 주소는 필수 입력 항목입니다.");
  }

  const totalAmount = input.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const orderNumber = generateOrderNumber();
  const orderId = randomUUID();

  const { error } = await supabasePublic.from("orders").insert({
    id: orderId,
    order_number: orderNumber,
    customer_name: input.customerName.trim(),
    phone: input.phone.trim(),
    zipcode: input.zipcode.trim(),
    address: input.address.trim(),
    address_detail: input.addressDetail.trim(),
    request_note: input.requestNote.trim(),
    total_amount: totalAmount,
    status: "pending",
  });

  if (error) {
    throw new Error("주문 생성에 실패했습니다: " + error.message);
  }

  const itemsPayload = input.items.map((i) => ({
    order_id: orderId,
    product_id: i.productId,
    product_name: i.name,
    price: i.price,
    quantity: i.quantity,
  }));

  const { error: itemsError } = await supabasePublic
    .from("order_items")
    .insert(itemsPayload);

  if (itemsError) {
    throw new Error("주문 상품 저장에 실패했습니다: " + itemsError.message);
  }

  // 관리자에게 이메일 알림 발송 (실패해도 주문 완료 자체는 정상 처리됩니다)
  await sendAdminOrderEmail({
    orderNumber,
    customerName: input.customerName.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    addressDetail: input.addressDetail.trim(),
    requestNote: input.requestNote.trim(),
    totalAmount,
    items: input.items,
  });

  return { orderNumber, totalAmount };
}
