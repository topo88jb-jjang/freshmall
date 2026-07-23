"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUS_LABEL, OrderStatus } from "@/lib/types";
import { updateOrderStatus } from "./actions";

const STATUSES: OrderStatus[] = ["pending", "paid", "preparing", "shipped", "done", "canceled"];

export default function StatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value as OrderStatus)}
        className="border border-ink/15 rounded-md px-3 py-2 text-sm"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <button
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          await updateOrderStatus(orderId, value);
          router.refresh();
          setSaving(false);
        }}
        className="px-4 py-2 rounded-md bg-forest text-cream text-sm hover:bg-ink disabled:opacity-50"
      >
        {saving ? "저장 중..." : "상태 변경"}
      </button>
    </div>
  );
}
