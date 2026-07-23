-- FreshMall 업데이트 SQL (v5) - 이미지 업로드를 브라우저에서 Supabase로 직접 보내기 위한 권한 설정
-- (Vercel 서버 함수의 4.5MB 요청 용량 제한을 우회하기 위함)
-- Supabase SQL Editor에서 전체 붙여넣고 Run 하세요.

create policy "public insert product-images" on storage.objects
for insert
with check (bucket_id = 'product-images');
