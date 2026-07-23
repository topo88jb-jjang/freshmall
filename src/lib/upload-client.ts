"use client";

import { supabasePublic } from "@/lib/supabase";

const BUCKET = "product-images";
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

// 브라우저에서 Vercel 서버를 거치지 않고 Supabase Storage로 바로 업로드합니다.
// (Vercel 서버 함수는 요청 하나당 4.5MB로 크기가 제한되어 있어, 스마트폰 사진처럼
// 큰 파일은 서버를 거치면 413 오류가 나기 때문에 이렇게 우회합니다.)
export async function uploadProductImageClient(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("이미지 용량은 8MB 이하만 가능합니다.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabasePublic.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(
      "이미지 업로드에 실패했습니다: " +
        error.message +
        " (Supabase에 'product-images' 저장소 버킷과 업로드 권한이 설정되어 있는지 확인해주세요.)"
    );
  }

  const { data } = supabasePublic.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
