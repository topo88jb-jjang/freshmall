"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "./actions";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await loginAdmin(password);
    setLoading(false);
    if (res.success) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-24">
      <h1 className="text-2xl mb-8 text-ink" style={{ fontFamily: "var(--font-display)" }}>
        관리자 로그인
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          required
          placeholder="관리자 비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-ink/15 rounded-md px-3 py-2.5 text-sm"
          autoFocus
        />
        {error && <p className="text-tomato text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-md bg-forest text-cream hover:bg-ink disabled:opacity-50"
        >
          {loading ? "확인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}
