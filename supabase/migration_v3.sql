-- FreshMall 업데이트 SQL (v3) - 상품 구매 옵션(용량/구성 선택) 기능
-- Supabase SQL Editor에서 전체 붙여넣고 Run 하세요.

create table if not exists product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  label text not null,          -- 예: "1kg 1박스", "3kg 1박스"
  price integer not null,       -- 이 옵션 선택 시 가격
  stock integer not null default 0,
  sort_order int not null default 0
);

alter table product_options enable row level security;

create policy "public read product_options" on product_options for select using (true);
