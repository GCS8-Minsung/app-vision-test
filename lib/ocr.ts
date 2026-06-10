"use client";

import type { MedicationOcrResult } from "./ocrParser";

const MAX_BYTES = 3_500_000; // Claude API 이미지 한도보다 여유를 둔 3.5MB

async function compressIfNeeded(file: File): Promise<File> {
  if (file.size <= MAX_BYTES) return file;

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.sqrt(MAX_BYTES / file.size);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.naturalWidth  * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) =>
          resolve(blob ? new File([blob], file.name, { type: "image/jpeg" }) : file),
        "image/jpeg",
        0.88
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

export async function extractMedicationInfo(file: File): Promise<MedicationOcrResult> {
  try {
    const compressed = await compressIfNeeded(file);
    const body = new FormData();
    body.append("image", compressed);

    const res = await fetch("/api/ocr", { method: "POST", body });
    if (!res.ok) throw new Error(`OCR API ${res.status}`);

    return await res.json() as MedicationOcrResult;
  } catch (err) {
    console.warn("[OCR] API 호출 실패, 빈 양식으로 진행합니다.", err);
    return {
      itemName: "", ingredientName: "", dosage: "",
      hospitalName: "", conditionName: "", source: "empty",
    };
  }
}
