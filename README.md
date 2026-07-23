# 프레시마켓 (FreshMall)

산지 직송 신선식품 쇼핑몰. Next.js 14 + Supabase 기반이며, PG 결제 연동 없이
주문 정보(이름/연락처/주소)를 DB에 저장하고, 관리자가 무통장입금 확인 후
직접 배송 상태를 관리하는 구조입니다.

## 포함된 기능

**고객 페이지**
- 홈 / 카테고리별 상품 목록 / 상품 상세
- 장바구니 (브라우저 로컬 저장)
- 주문서 작성 → Supabase에 주문 저장 (결제 연동 없음, 무통장입금 안내)
- 주문 완료 페이지, 주문번호+연락처로 주문 조회

**관리자 페이지** (`/admin`)
- 비밀번호 로그인 (쿠키 세션)
- 대시보드 (상품수, 입금대기 건수, 최근 주문)
- 상품 등록/수정/삭제/노출·숨김
- 주문 목록/상태별 필터, 주문 상세, 배송 상태 변경
  (입금대기 → 결제확인 → 배송준비 → 배송중 → 배송완료 / 취소)

---

## 1. Supabase 설정 (데이터베이스)

1. https://supabase.com 에서 새 프로젝트를 생성합니다.
2. 좌측 메뉴 **SQL Editor** → 이 프로젝트의 `supabase/schema.sql` 파일 내용을
   전체 복사해서 붙여넣고 **Run** 을 눌러 실행합니다.
   - 테이블(categories, products, orders, order_items) 생성
   - RLS(행 단위 보안) 정책 적용
   - 샘플 카테고리/상품 데이터 자동 등록
3. 좌측 메뉴 **Project Settings → API** 에서 아래 3개 값을 복사해둡니다.
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` 키 → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ 절대 외부 노출 금지, 서버 환경변수로만 등록)

## 2. 로컬에서 먼저 확인해보기 (선택)

```bash
npm install
cp .env.example .env.local   # 값을 위에서 복사한 값으로 채워넣기
npm run dev
```

`http://localhost:3000` 에서 쇼핑몰을, `http://localhost:3000/admin/login` 에서
관리자 페이지(.env.local의 ADMIN_PASSWORD로 로그인)를 확인할 수 있습니다.

## 3. Vercel로 실제 도메인 배포하기

1. 이 프로젝트 폴더를 GitHub 저장소로 push 합니다.
   ```bash
   git init
   git add .
   git commit -m "freshmall initial commit"
   git branch -M main
   git remote add origin <내 GitHub 저장소 주소>
   git push -u origin main
   ```
2. https://vercel.com → **Add New → Project** → 방금 push한 GitHub 저장소 선택 → Import
   (Framework Preset은 Next.js로 자동 인식됩니다)
3. **Environment Variables** 에 아래 5개를 등록합니다.
   | Key | 값 |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
   | `ADMIN_PASSWORD` | 원하는 관리자 비밀번호 |
   | `ADMIN_SESSION_SECRET` | 임의의 긴 랜덤 문자열 (로그인 세션 검증용) |
4. **Deploy** 클릭 → 완료되면 `https://프로젝트명.vercel.app` 주소로 바로 접속 가능합니다.
5. 내 도메인을 연결하려면 Vercel 프로젝트 **Settings → Domains** 에서 보유 중인
   도메인을 추가하고 안내되는 DNS 레코드(A/CNAME)를 도메인 등록업체(가비아, 카페24 등)에
   설정하면 됩니다.

> Netlify를 쓰고 싶다면 `@netlify/plugin-nextjs` 플러그인을 추가해 배포할 수 있지만,
> Server Actions/App Router는 Vercel에서 가장 안정적으로 동작하므로 Vercel을 권장합니다.

## 4. 배포 후 확인할 것

- `/admin/login` 에서 설정한 `ADMIN_PASSWORD`로 로그인 → 상품 등록/수정
- 고객 화면에서 상품 담기 → 주문 → `/admin/orders` 에서 주문이 들어오는지 확인
- 실제 계좌번호로 `src/app/order-complete/[orderNumber]/page.tsx` 내
  "입금 계좌 안내" 문구를 본인 계좌 정보로 수정
- 하단 푸터(`src/components/Footer.tsx`)의 사업자 정보를 실제 정보로 수정

## 5. 다음에 추가하면 좋은 것

- PG(카드/간편결제) 연동 — 포트원(아임포트), 나이스페이 등
- 관리자 다중 계정/권한 분리 (현재는 단일 비밀번호 방식)
- 상품 이미지 업로드 (현재는 이미지 URL 직접 입력 방식) — Supabase Storage 연동
- 알림톡/문자 발송 (주문 접수, 배송 상태 변경 시 고객에게 자동 안내)

---

### 폴더 구조 요약

```
src/app/                      # 고객 페이지 (홈, 상품, 장바구니, 주문)
src/app/admin/login           # 관리자 로그인 (인증 레이아웃 밖)
src/app/admin/(protected)/    # 관리자 페이지 (로그인 필요, route group)
src/lib/supabase.ts           # 공개용/관리자용(service role) 클라이언트
src/context/CartContext.tsx   # 장바구니 상태 (localStorage)
supabase/schema.sql           # DB 스키마 + RLS + 샘플 데이터
```
