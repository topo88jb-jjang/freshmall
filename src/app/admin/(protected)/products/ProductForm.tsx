"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Category, Product, ProductOption } from "@/lib/types";
import { createProduct, updateProduct, ProductFormInput, ProductOptionInput } from "./actions";
import { uploadProductImage } from "./upload-actions";

const MAX_OPTIONS = 12;

export default function ProductForm({
  categories,
  product,
  existingOptions,
}: {
  categories: Category[];
  product?: Product;
  existingOptions?: ProductOption[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: product?.name ?? "",
    categoryId: product?.category_id ?? "",
    description: product?.description ?? "",
    origin: product?.origin ?? "",
    unitLabel: product?.unit_label ?? "1개",
    price: product?.price?.toString() ?? "",
    discountPrice: product?.discount_price?.toString() ?? "",
    stock: product?.stock?.toString() ?? "0",
    isActive: product?.is_active ?? true,
    isFeatured: product?.is_featured ?? false,
  });
  const [thumbnailUrl, setThumbnailUrl] = useState(product?.image_url ?? "");
  const [detailImageUrls, setDetailImageUrls] = useState<string[]>(
    product?.detail_image_urls ?? []
  );
  const [options, setOptions] = useState<ProductOptionInput[]>(
    (existingOptions ?? []).map((o) => ({
      label: o.label,
      price: o.price,
      discountPrice: o.discount_price,
      stock: o.stock,
    }))
  );
  const [thumbUploading, setThumbUploading] = useState(false);
  const [detailUploading, setDetailUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const thumbInputRef = useRef<HTMLInputElement>(null);
  const detailInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadProductImage(fd);
      setThumbnailUrl(result.url);
    } catch (err: any) {
      setError(err.message ?? "썸네일 업로드에 실패했습니다.");
    } finally {
      setThumbUploading(false);
      if (thumbInputRef.current) thumbInputRef.current.value = "";
    }
  };

  const handleDetailSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setDetailUploading(true);
    setError("");
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const result = await uploadProductImage(fd);
        setDetailImageUrls((prev) => [...prev, result.url]);
      }
    } catch (err: any) {
      setError(err.message ?? "상세 이미지 업로드에 실패했습니다.");
    } finally {
      setDetailUploading(false);
      if (detailInputRef.current) detailInputRef.current.value = "";
    }
  };

  const removeDetailImage = (url: string) => {
    setDetailImageUrls((prev) => prev.filter((u) => u !== url));
  };

  const addOption = () => {
    setOptions((prev) =>
      prev.length >= MAX_OPTIONS
        ? prev
        : [...prev, { label: "", price: 0, discountPrice: null, stock: 0 }]
    );
  };

  const updateOption = (index: number, patch: Partial<ProductOptionInput>) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, ...patch } : o)));
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!thumbnailUrl) {
      setError("썸네일 이미지를 업로드해주세요.");
      setSubmitting(false);
      return;
    }

    const validOptions = options.filter((o) => o.label.trim());
    if (options.some((o) => o.label.trim() && (!o.price || o.price <= 0))) {
      setError("옵션 정상판매가는 0보다 커야 합니다.");
      setSubmitting(false);
      return;
    }
    if (
      options.some(
        (o) => o.label.trim() && o.discountPrice != null && o.discountPrice >= o.price
      )
    ) {
      setError("옵션 할인판매가는 정상판매가보다 낮아야 합니다.");
      setSubmitting(false);
      return;
    }

    const payload: ProductFormInput = {
      name: form.name,
      categoryId: form.categoryId,
      description: form.description,
      origin: form.origin,
      unitLabel: form.unitLabel,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      stock: Number(form.stock),
      imageUrl: thumbnailUrl,
      detailImageUrls,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      options: validOptions,
    };
    try {
      if (product) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }
    } catch (err: any) {
      setError(err.message ?? "저장에 실패했습니다.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <Row label="상품명 *">
        <input
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="input"
        />
      </Row>
      <Row label="카테고리">
        <select
          value={form.categoryId}
          onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
          className="input"
        >
          <option value="">선택 안 함</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Row>

      <Row label="상품 썸네일 (목록/카드에 보이는 대표 이미지) *">
        <div className="flex items-center gap-4">
          {thumbnailUrl ? (
            <div className="relative w-24 h-24 rounded-md overflow-hidden bg-stone/40 shrink-0">
              <Image src={thumbnailUrl} alt="썸네일 미리보기" fill className="object-cover" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-md bg-stone/30 flex items-center justify-center text-xs text-ink/40 shrink-0">
              미리보기
            </div>
          )}
          <div>
            <input
              ref={thumbInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailSelect}
              disabled={thumbUploading}
              className="text-xs"
            />
            {thumbUploading && <p className="text-xs text-ink/50 mt-1">업로드 중...</p>}
          </div>
        </div>
      </Row>

      <Row label="상품 상세페이지 이미지 (여러 장 가능, 상세페이지 본문에 순서대로 표시)">
        <input
          ref={detailInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleDetailSelect}
          disabled={detailUploading}
          className="text-xs"
        />
        {detailUploading && <p className="text-xs text-ink/50 mt-1">업로드 중...</p>}
        {detailImageUrls.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {detailImageUrls.map((url) => (
              <div key={url} className="relative">
                <div className="relative w-full aspect-square rounded-md overflow-hidden bg-stone/40">
                  <Image src={url} alt="상세 이미지" fill className="object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => removeDetailImage(url)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-ink text-cream text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </Row>

      <div className="grid grid-cols-2 gap-3">
        <Row label="원산지">
          <input
            value={form.origin}
            onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
            className="input"
          />
        </Row>
        <Row label="판매 단위">
          <input
            value={form.unitLabel}
            onChange={(e) => setForm((f) => ({ ...f, unitLabel: e.target.value }))}
            className="input"
            placeholder="예: 1kg, 500g, 1box"
          />
        </Row>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Row label="기본 정가 *">
          <input
            required
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className="input"
          />
        </Row>
        <Row label="기본 할인가">
          <input
            type="number"
            min={0}
            value={form.discountPrice}
            onChange={(e) => setForm((f) => ({ ...f, discountPrice: e.target.value }))}
            className="input"
          />
        </Row>
        <Row label="기본 재고 *">
          <input
            required
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
            className="input"
          />
        </Row>
      </div>
      <p className="text-xs text-ink/40 -mt-2">
        아래에 구매 옵션을 추가하면, 고객은 기본 가격 대신 옵션 중 하나를 선택해서 구매하게
        됩니다. 옵션을 하나도 안 만들면 지금처럼 단품으로 판매돼요.
      </p>

      <Row label={`구매 옵션 (선택, 최대 ${MAX_OPTIONS}개) — 예: "1kg 1박스", "3kg 1박스"`}>
        <div className="space-y-3">
          {options.map((opt, idx) => (
            <div key={idx} className="border border-ink/10 rounded-md p-3 space-y-2">
              <div className="flex gap-2 items-center">
                <input
                  placeholder="옵션명 (예: 3kg 1박스)"
                  value={opt.label}
                  onChange={(e) => updateOption(idx, { label: e.target.value })}
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeOption(idx)}
                  className="w-8 h-8 shrink-0 rounded-md border border-ink/15 text-ink/50 hover:text-tomato hover:border-tomato"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="block text-[11px] text-ink/40 mb-1">정상판매가 *</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="30000"
                    value={opt.price || ""}
                    onChange={(e) => updateOption(idx, { price: Number(e.target.value) })}
                    className="input"
                  />
                </div>
                <div>
                  <span className="block text-[11px] text-ink/40 mb-1">할인판매가 (선택)</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="15000"
                    value={opt.discountPrice ?? ""}
                    onChange={(e) =>
                      updateOption(idx, {
                        discountPrice: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <span className="block text-[11px] text-ink/40 mb-1">재고 *</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="30"
                    value={opt.stock || ""}
                    onChange={(e) => updateOption(idx, { stock: Number(e.target.value) })}
                    className="input"
                  />
                </div>
              </div>
            </div>
          ))}
          {options.length < MAX_OPTIONS && (
            <button
              type="button"
              onClick={addOption}
              className="text-sm text-forest hover:text-ink underline underline-offset-2"
            >
              + 옵션 추가 ({options.length}/{MAX_OPTIONS})
            </button>
          )}
        </div>
      </Row>

      <Row label="상품 설명">
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="input resize-none"
        />
      </Row>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
          />
          판매중
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
          />
          오늘의 추천에 노출
        </label>
      </div>

      {error && <p className="text-tomato text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting || thumbUploading || detailUploading}
          className="px-6 py-2.5 rounded-md bg-forest text-cream text-sm hover:bg-ink disabled:opacity-50"
        >
          {submitting ? "저장 중..." : product ? "수정 저장" : "상품 등록"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="px-6 py-2.5 rounded-md border border-ink/15 text-sm"
        >
          취소
        </button>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid rgba(31, 42, 29, 0.15);
          border-radius: 6px;
          padding: 9px 12px;
          font-size: 14px;
          background: white;
        }
        .input:focus {
          outline: 2px solid #e4572e;
          outline-offset: 1px;
        }
      `}</style>
    </form>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-ink/50 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
