-- FreshMall (신선식품 쇼핑몰) 스키마
-- Supabase SQL Editor 에서 전체 붙여넣고 실행하세요.

create extension if not exists "pgcrypto";

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text default '',
  origin text default '',        -- 원산지
  unit_label text default '1개', -- 판매 단위 (예: 1kg, 1box, 500g)
  price integer not null,
  discount_price integer,
  stock integer not null default 0,
  image_url text default '',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  phone text not null,
  zipcode text default '',
  address text not null,
  address_detail text default '',
  request_note text default '',
  total_amount integer not null,
  status text not null default 'pending',
  -- pending(입금대기) / paid(결제확인) / preparing(배송준비) / shipped(배송중) / done(배송완료) / canceled(취소)
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  price integer not null,
  quantity integer not null
);

-- RLS
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- 공개 조회: 카테고리 전체, 판매중 상품만
create policy "public read categories" on categories for select using (true);
create policy "public read active products" on products for select using (is_active = true);

-- 고객 주문 생성은 anon key로 허용 (결제 연동 없이 주문서만 저장)
create policy "public insert orders" on orders for insert with check (true);
create policy "public insert order_items" on order_items for insert with check (true);

-- 주문 조회(주문번호+연락처로 본인 주문만 확인하는 용도)는 서버(service role)에서 처리하므로
-- select 정책은 별도로 열어주지 않습니다. 관리자 기능(수정/삭제/주문상태변경)은
-- 반드시 SUPABASE_SERVICE_ROLE_KEY 를 사용하는 서버 코드에서만 수행됩니다 (RLS 우회).

-- 샘플 카테고리 & 상품 데이터
insert into categories (name, slug, sort_order) values
  ('채소', 'vegetables', 1),
  ('과일', 'fruits', 2),
  ('정육', 'meat', 3),
  ('수산', 'seafood', 4),
  ('반찬/간편식', 'sidedish', 5)
on conflict (slug) do nothing;

insert into products (category_id, name, slug, description, origin, unit_label, price, discount_price, stock, image_url, is_featured)
select id, '유기농 방울토마토', 'organic-cherry-tomato', '당도 높은 유기농 방울토마토입니다. 매일 아침 수확 후 당일 발송합니다.', '국내산(전남 완도)', '500g', 8900, 6900, 120, 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800', true
from categories where slug = 'vegetables'
on conflict (slug) do nothing;

insert into products (category_id, name, slug, description, origin, unit_label, price, discount_price, stock, image_url, is_featured)
select id, '해남 꿀고구마', 'haenam-sweet-potato', '달콤하고 포근한 해남 꿀고구마.', '국내산(전남 해남)', '3kg', 15900, null, 80, 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=800', false
from categories where slug = 'vegetables'
on conflict (slug) do nothing;

insert into products (category_id, name, slug, description, origin, unit_label, price, discount_price, stock, image_url, is_featured)
select id, '완숙 애플망고', 'apple-mango', '진한 향의 완숙 애플망고 3입.', '수입산(태국)', '3입', 19900, 15900, 45, 'https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=800', true
from categories where slug = 'fruits'
on conflict (slug) do nothing;

insert into products (category_id, name, slug, description, origin, unit_label, price, discount_price, stock, image_url, is_featured)
select id, '한우 등심 1++', 'hanwoo-sirloin', '1++ 등급 한우 등심 선물세트.', '국내산(한우)', '600g', 89000, null, 20, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800', true
from categories where slug = 'meat'
on conflict (slug) do nothing;

insert into products (category_id, name, slug, description, origin, unit_label, price, discount_price, stock, image_url, is_featured)
select id, '노르웨이 생연어', 'norway-salmon', '초신선 노르웨이산 생연어회.', '노르웨이산', '500g', 24900, 19900, 60, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800', false
from categories where slug = 'seafood'
on conflict (slug) do nothing;

-- (신규 설치 시 최신 스키마 반영: 상세 이미지 컬럼 + 상품 이미지 저장 버킷)
alter table products add column if not exists detail_image_urls text[] not null default '{}';

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- (신규 설치 시 최신 스키마 반영: 상품 구매 옵션)
create table if not exists product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  label text not null,
  price integer not null,
  stock integer not null default 0,
  sort_order int not null default 0
);

alter table product_options enable row level security;

do $$ begin
  create policy "public read product_options" on product_options for select using (true);
exception when duplicate_object then null;
end $$;
