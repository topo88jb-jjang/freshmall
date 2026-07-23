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
          상호 다니픽마켓 · 대표 이유진 · 사업자등록번호 796-19-02270<br />
          통신판매업신고 제2025-성남중원-0575호 · 고객센터 010-8114-0946 (평일 10:00–17:00)<br />
          본 사이트는 상품 주문접수 목적의 주문전용 쇼핑몰로 실제 결제(PG) 연동은 포함되어 있지 않습니다.
        </p>
      </div>
    </footer>
  );
}
