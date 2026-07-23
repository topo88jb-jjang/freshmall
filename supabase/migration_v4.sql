-- FreshMall 업데이트 SQL (v4) - 옵션별 정상가/할인가 지원
-- Supabase SQL Editor에서 전체 붙여넣고 Run 하세요.

alter table product_options add column if not exists discount_price integer;
