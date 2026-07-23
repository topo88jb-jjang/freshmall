import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-ink/10 bg-forest text-cream/80">
      <div className="max-w-6xl mx-auto px-4 py-10 text-sm space-y-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="text-cream font-medium" style={{ fontFamily: "var(--font-display)" }}>
            프레시마켓
          </span>
          <Link href="/products" className="hover:text-cream">전체상품</Link>
          <Link href="/orders/lookup" className="hover:text-cream">주문조회</Link>
          <Link href="/admin/login" className="hover:text-cream">관리자</Link>
        </div>
        <p className="text-cream/50 leading-relaxed">
          상호 프레시마켓 · 대표 홍길동 · 사업자등록번호 000-00-00000<br />
          통신판매업신고 제0000-서울00-0000호 · 고객센터 02-000-0000 (평일 10:00–18:00)<br />
          본 사이트는 데모/포트폴리오 목적의 쇼핑몰 예시로 실제 결제(PG) 연동은 포함되어 있지 않습니다.
        </p>
      </div>
    </footer>
  );
}
