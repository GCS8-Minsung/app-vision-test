"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MedicationForm, type MedicationFormValue } from "@/components/MedicationForm";
import { StepIndicator } from "@/components/StepIndicator";
import { createId } from "@/lib/ids";
import { analyzeRisk } from "@/lib/riskEngine";
import { draftStorage, storage } from "@/lib/storage";

const EMPTY_FORM: MedicationFormValue = {
  itemName: "", ingredientName: "", dosage: "", hospitalName: "", conditionName: ""
};

function getOcrSourceLabel(source?: string, confidence?: number): string {
  if (source === "claude-vision") return "AI가 이미지에서 자동으로 추출한 초안입니다. 내용을 확인·수정 후 저장하세요.";
  if (source === "tesseract") {
    const score = typeof confidence === "number" ? ` 신뢰도 ${Math.round(confidence)}%` : "";
    return `브라우저 OCR로 인식한 초안입니다.${score}`;
  }
  if (source === "filename-fallback") return "데모 파일명 기준 샘플 초안입니다.";
  return "자동 인식된 정보가 부족합니다. 직접 입력해주세요.";
}

export default function ReviewPage() {
  const router = useRouter();
  const [value, setValue] = useState<MedicationFormValue>(EMPTY_FORM);
  const [ocrSourceLabel, setOcrSourceLabel] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const draft = draftStorage.getDraftOcr();
    if (draft) {
      setValue(draft);
      setOcrSourceLabel(getOcrSourceLabel(draft.source, draft.confidence));
    }
  }, []);

  function handleSubmit() {
    const profile = storage.getProfile();
    const uploadId = draftStorage.getDraftUploadId();
    if (!profile || !uploadId) { router.push("/upload"); return; }
    if (!value.itemName.trim()) { setError("약 이름/제품명을 입력해주세요."); return; }

    const itemId = createId("item");
    const riskId = createId("risk");
    const now = new Date().toISOString();
    const item = {
      id: itemId, uploadId, userId: profile.id,
      itemName: value.itemName.trim(),
      ingredientName: value.ingredientName.trim() || undefined,
      dosage: value.dosage.trim() || undefined,
      hospitalName: value.hospitalName.trim() || undefined,
      conditionName: value.conditionName.trim() || undefined,
      userConfirmed: true, createdAt: now
    };
    const risk = analyzeRisk(item);
    storage.saveExtractedItem(item);
    storage.saveRiskCheck({ id: riskId, itemId, ...risk, createdAt: now });
    draftStorage.saveCurrentResult(itemId, riskId);
    router.push("/result");
  }

  return (
    <main className="flow-shell">
      <StepIndicator current={2} />

      <div className="section-card mt-2 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-[#e6e0e9] mb-1">추출 결과 확인</h1>
          <p className="text-sm text-[#cbc4d2]">
            인식된 정보가 틀릴 수 있습니다. 약 이름과 성분명을 직접 확인해주세요.
          </p>
        </div>

        {ocrSourceLabel && (
          <div
            className="rounded-xl p-3 text-sm font-medium"
            style={{
              background: "rgba(52, 211, 153, 0.08)",
              border: "1px solid rgba(52, 211, 153, 0.25)",
              color: "#34d399"
            }}
          >
            {ocrSourceLabel}
          </div>
        )}

        <MedicationForm value={value} error={error} onChange={setValue} onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
