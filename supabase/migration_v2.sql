-- FreshMall 업데이트 SQL
-- Supabase SQL Editor에서 전체 붙여넣고 Run 하세요.
-- (이미 운영중인 프로젝트에 새 기능을 추가하는 마이그레이션입니다)

-- 1) 카테고리 정리: 수산 삭제, 반찬/간편식 → 간편식으로 이름 변경
delete from categories where slug = 'seafood';
update categories set name = '간편식' where slug = 'sidedish';

-- 2) 상품 상세페이지용 이미지 여러 장을 저장할 컬럼 추가
alter table products add column if not exists detail_image_urls text[] not null default '{}';

-- 3) 상품 이미지를 저장할 Storage 버킷 생성 (공개 버킷 - 누구나 이미지 조회 가능)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
