import { CartItem } from "@/lib/types";

type OrderEmailInput = {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  addressDetail: string;
  requestNote: string;
  totalAmount: number;
  items: CartItem[];
};

export async function sendAdminOrderEmail(input: OrderEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

  // 이메일 설정이 안 되어 있으면 조용히 건너뜁니다 (주문 자체는 정상 처리되어야 하므로).
  if (!apiKey || !adminEmail) {
    console.warn(
      "이메일 알림이 설정되지 않았습니다 (RESEND_API_KEY / ADMIN_NOTIFICATION_EMAIL 확인 필요)."
    );
    return;
  }

  const itemsHtml = input.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;">${escapeHtml(
            i.optionLabel ? `${i.name} - ${i.optionLabel}` : i.name
          )}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center;">${i.quantity}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right;">${(i.price * i.quantity).toLocaleString(
            "ko-KR"
          )}원</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
      <h2 style="color:#233D24;">새 주문이 접수되었습니다</h2>
      <p style="color:#555;">주문번호 <strong>${escapeHtml(input.orderNumber)}</strong></p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr style="background:#f3f1ea;">
            <th style="padding:6px 10px;text-align:left;">상품</th>
            <th style="padding:6px 10px;">수량</th>
            <th style="padding:6px 10px;text-align:right;">금액</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="font-weight:bold;">총 결제금액: ${input.totalAmount.toLocaleString("ko-KR")}원</p>
      <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
      <p style="color:#333;margin:4px 0;">주문자: ${escapeHtml(input.customerName)}</p>
      <p style="color:#333;margin:4px 0;">연락처: ${escapeHtml(input.phone)}</p>
      <p style="color:#333;margin:4px 0;">배송지: ${escapeHtml(input.address)} ${escapeHtml(
    input.addressDetail
  )}</p>
      ${input.requestNote ? `<p style="color:#333;margin:4px 0;">요청사항: ${escapeHtml(input.requestNote)}</p>` : ""}
      <p style="color:#999;font-size:12px;margin-top:24px;">관리자 페이지 주문 관리에서 상세 확인 및 상태 변경이 가능합니다.</p>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FreshMall 주문알림 <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `[프레시마켓] 새 주문 접수 - ${input.orderNumber}`,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("주문 알림 이메일 발송 실패:", res.status, errText);
    }
  } catch (err) {
    // 이메일 발송 실패가 주문 처리 자체를 막으면 안 되므로 에러를 삼킵니다.
    console.error("주문 알림 이메일 발송 중 오류:", err);
  }
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
