export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string;
  origin: string;
  unit_label: string;
  price: number;
  discount_price: number | null;
  stock: number;
  image_url: string;
  detail_image_urls: string[];
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "preparing"
  | "shipped"
  | "done"
  | "canceled";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "입금대기",
  paid: "결제확인",
  preparing: "배송준비",
  shipped: "배송중",
  done: "배송완료",
  canceled: "취소",
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  zipcode: string;
  address: string;
  address_detail: string;
  request_note: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  price: number;
  quantity: number;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  unitLabel: string;
  imageUrl: string;
  quantity: number;
  stock: number;
};

export function formatWon(amount: number) {
  return amount.toLocaleString("ko-KR") + "원";
}
