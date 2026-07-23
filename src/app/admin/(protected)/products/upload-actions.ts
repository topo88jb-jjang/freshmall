"use server";

import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminAuthed } from "@/lib/auth";

const BUCKET = "product-images";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadProductImage(formData: FormData): Promise<{ url: string }> {
  if (!isAdminAuthed()) {
    throw new Error("관리자 인증이 필요합니다.");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("업로드할 파일을 찾을 수 없습니다.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("이미지 용량은 5MB 이하만 가능합니다.");
  }

  const admin = supabaseAdmin();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(
      "이미지 업로드에 실패했습니다: " +
        error.message +
        " (Supabase에 'product-images' 저장소 버킷이 있는지 확인해주세요.)"
    );
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
