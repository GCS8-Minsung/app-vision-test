"use client";

import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { AlertTriangle, CloudUpload } from "lucide-react";
import { StepIndicator } from "@/components/StepIndicator";
import { UploadCard } from "@/components/UploadCard";
import { UPLOAD_TYPE_LABELS } from "@/lib/constants";
import { createId } from "@/lib/ids";
import { extractMedicationInfo } from "@/lib/ocr";
import { draftStorage, storage } from "@/lib/storage";
import type { UploadType } from "@/lib/types";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("이미지를 읽을 수 없습니다."));
    reader.readAsDataURL(file);
  });
}

export default function UploadPage() {
  const router = useRouter();
  const [uploadType, setUploadType] = useState<UploadType>("medicine_package");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ocrStatus, setOcrStatus] = useState("");

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setError("");
    setPreview(nextFile ? await fileToDataUrl(nextFile) : "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const profile = storage.getProfile();
    if (!profile) { router.push("/onboarding"); return; }
    if (!file || !preview) { setError("업로드할 이미지를 선택해주세요."); return; }
    setSubmitting(true);
    setOcrStatus("이미지에서 글자를 읽는 중입니다. 잠시만 기다려주세요.");
    const uploadId = createId("upload");
    storage.saveUpload({
      id: uploadId, userId: profile.id, uploadType,
      imageDataUrl: preview, fileName: file.name, createdAt: new Date().toISOString()
    });
    draftStorage.saveDraftUploadId(uploadId);
    const extracted = await extractMedicationInfo(file);
    draftStorage.saveDraftOcr(extracted);
    router.push("/review");
  }

  return (
    <main className="flow-shell">
      <StepIndicator current={1} />

      <div className="section-card mt-2 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-[#e6e0e9] mb-1">이미지 업로드</h1>
          <p className="text-sm text-[#cbc4d2]">처방전, 약 봉투, 성분표를 사진으로 등록하세요.</p>
        </div>

        {/* Privacy warning */}
        <div
          className="flex gap-3 items-start rounded-xl p-3 text-sm"
          style={{ background: "rgba(255,180,171,0.08)", border: "1px solid rgba(255,180,171,0.25)" }}
        >
          <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: "#ffb4ab" }} />
          <p className="text-[#ffb4ab]">
            주민번호, 카드번호, 주소 등 민감정보가 보이면 업로드 전 가려주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div>
            <label htmlFor="uploadType" className="form-label">이미지 유형 선택</label>
            <select
              id="uploadType"
              data-testid="upload-type-select"
              className="form-input"
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value as UploadType)}
              style={{ backgroundImage: "none" }}
            >
              {Object.entries(UPLOAD_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {/* Drop zone / file input */}
          <div>
            <label htmlFor="file" className="form-label">이미지 파일</label>
            {!preview ? (
              <label
                htmlFor="file"
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl p-8 text-center transition-colors hover:border-[#7c4dff]"
                style={{
                  background: "#1e262d",
                  border: "2px dashed #3d4a56",
                  minHeight: "180px"
                }}
              >
                <div
                  className="flex size-16 items-center justify-center rounded-full"
                  style={{ background: "rgba(124, 77, 255, 0.1)" }}
                >
                  <CloudUpload size={28} style={{ color: "#cfbcff" }} />
                </div>
                <div>
                  <p className="font-medium text-[#e6e0e9]">이미지를 여기에 놓으세요</p>
                  <p className="mt-1 text-xs text-[#948e9c]">또는 클릭하여 선택 · PNG, JPG, HEIC</p>
                </div>
              </label>
            ) : null}
            <input
              id="file"
              data-testid="file-input"
              className={preview ? "form-input" : "sr-only"}
              type="file"
              accept="image/*"
              onChange={handleFile}
            />
          </div>

          {preview && <UploadCard preview={preview} fileName={file?.name} />}

          {ocrStatus && (
            <div
              className="rounded-xl p-3 text-sm font-medium text-[#cfbcff]"
              style={{ background: "rgba(207, 188, 255, 0.08)", border: "1px solid rgba(207, 188, 255, 0.2)" }}
              role="status"
            >
              {ocrStatus}
            </div>
          )}

          {error && (
            <p className="text-sm font-semibold" style={{ color: "#ffb4ab" }}>{error}</p>
          )}

          <button
            data-testid="upload-submit"
            type="submit"
            className="primary-button w-full"
            disabled={submitting}
          >
            {submitting ? "문자 인식 중…" : "분석 정보 입력하기"}
          </button>
        </form>
      </div>
    </main>
  );
}
