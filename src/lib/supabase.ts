import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 공개(브라우저/서버 공용) 클라이언트 - RLS 정책이 적용됨(판매중 상품만 조회, 주문 생성만 가능)
export const supabasePublic = createClient(url, anonKey, {
  auth: { persistSession: false },
});

// 서버 전용 관리자 클라이언트 - service role 키로 RLS 우회. 절대 클라이언트 컴포넌트에서 import 금지.
export function supabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않았습니다. .env.local 또는 Vercel 환경변수를 확인하세요."
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
