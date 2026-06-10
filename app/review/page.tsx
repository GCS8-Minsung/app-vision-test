"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MedicationForm, type MedicationFormValue } from "@/components/MedicationForm";
import { StepIndicator } from "@/components/StepIndicator";
import { parseCompoundIngredients } from "@/lib/compoundIngredients";
import { createId } from "@/lib/ids";
import { formatIngredients } from "@/lib/medicationDatabase";
import { searchMedicationCandidates, type MedicationLookupClientResult } from "@/lib/medicationLookupClient";
import type { MedicationProductLookup } from "@/lib/medicationProviders/types";
import { buildOcrFieldConfidence } from "@/lib/ocrConfidence";
import { getHighestRiskLevel } from "@/lib/riskRanking";
import { analyzeRisk } from "@/lib/riskEngine";
import { draftStorage, storage } from "@/lib/storage";
import type { OcrFieldConfidence, VerificationKey } from "@/lib/types";

const EMPTY_FORM: MedicationFormValue = {
  itemName: "", ingredientName: "", dosage: "", hospitalName: "", conditionName: ""
};

function getOcrSourceLabel(source?: string, confidence?: number): string {
  if (source === "gemini-vision") return "AI가 이미지에서 자동으로 추출한 초안입니다. 내용을 확인·수정 후 저장하세요.";
  if (source === "local-parser") {
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
  const [confidence, setConfidence] = useState<OcrFieldConfidence>();
  const [lookupResults, setLookupResults] = useState<MedicationProductLookup[]>([]);
  const [lookupStatus, setLookupStatus] = useState<MedicationLookupClientResult["status"]>("empty");
  const [lookupMessage, setLookupMessage] = useState("");
  const [pendingLookup, setPendingLookup] = useState(false);
  const [pendingApply, setPendingApply] = useState<MedicationProductLookup | null>(null);
  const [verifiedFields, setVerifiedFields] = useState<VerificationKey[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const draft = draftStorage.getDraftOcr();
    if (draft) {
      setValue(draft);
      setOcrSourceLabel(getOcrSourceLabel(draft.source, draft.confidence));
      setConfidence(buildOcrFieldConfidence(draft));
    }
  }, []);

  useEffect(() => {
    const query = value.itemName.trim();
    if (query.length < 2) {
      setLookupResults([]);
      setLookupStatus("empty");
      setLookupMessage("");
      return;
    }

    let cancelled = false;
    setPendingLookup(true);
    const timer = window.setTimeout(() => {
      searchMedicationCandidates(query).then((result) => {
        if (cancelled) return;
        setLookupResults(result.results);
        setLookupStatus(result.status);
        setLookupMessage(result.message);
        setPendingLookup(false);
      });
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      setPendingLookup(false);
    };
  }, [value.itemName]);

  function applyMedicationLookup(result: MedicationProductLookup) {
    if ((value.ingredientName.trim() || value.dosage.trim()) && pendingApply?.id !== result.id) {
      setPendingApply(result);
      return;
    }

    const next = {
      ...value,
      ingredientName: formatIngredients(result.ingredients),
      dosage: result.dosage ?? value.dosage,
      itemName: value.itemName.trim() || result.productName
    };
    setValue(next);
    setConfidence(buildOcrFieldConfidence({ ...next, confidence: undefined }));
    setVerifiedFields((current) => Array.from(new Set([...current, "ingredient_checked", "dosage_checked"])));
    setPendingApply(null);
  }

  function handleSubmit() {
    const profile = storage.getProfile();
    const uploadId = draftStorage.getDraftUploadId();
    if (!profile || !uploadId) { router.push("/upload"); return; }
    if (!value.itemName.trim()) { setError("약 이름/제품명을 입력해주세요."); return; }

    const itemId = createId("item");
    const now = new Date().toISOString();
    const item = {
      id: itemId, uploadId, userId: profile.id,
      itemName: value.itemName.trim(),
      ingredientName: value.ingredientName.trim() || undefined,
      dosage: value.dosage.trim() || undefined,
      hospitalName: value.hospitalName.trim() || undefined,
      conditionName: value.conditionName.trim() || undefined,
      userConfirmed: true,
      ocrConfidence: confidence,
      userVerifiedFields: verifiedFields,
      createdAt: now
    };

    storage.saveExtractedItem(item);

    const substances = parseCompoundIngredients({
      ingredientName: item.ingredientName,
      dosage: item.dosage
    });
    const riskIds: { id: string; level: ReturnType<typeof analyzeRisk>["riskLevel"] }[] = [];

    if (substances.length > 0) {
      substances.forEach((substance) => {
        const substanceId = createId("substance");
        const riskId = createId("risk");
        const substanceRecord = {
          id: substanceId,
          itemId,
          userId: profile.id,
          ingredientName: substance.ingredientName,
          dosage: substance.dosage,
          sourceText: substance.sourceText,
          createdAt: now
        };
        const risk = analyzeRisk({
          itemName: item.itemName,
          ingredientName: substance.ingredientName,
          dosage: substance.dosage
        });

        storage.saveExtractedSubstance(substanceRecord);
        storage.saveRiskCheck({ id: riskId, itemId, substanceId, ...risk, createdAt: now });
        riskIds.push({ id: riskId, level: risk.riskLevel });
      });
    } else {
      const riskId = createId("risk");
      const risk = analyzeRisk(item);
      storage.saveRiskCheck({ id: riskId, itemId, ...risk, createdAt: now });
      riskIds.push({ id: riskId, level: risk.riskLevel });
    }

    const highestLevel = getHighestRiskLevel(riskIds.map((risk) => risk.level));
    const representativeRisk = riskIds.find((risk) => risk.level === highestLevel) ?? riskIds[0];
    draftStorage.saveCurrentResult(itemId, representativeRisk.id);
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

        {(lookupResults.length > 0 || pendingLookup || lookupMessage) && (
          <div
            className="rounded-xl p-3 text-sm"
            style={{ background: "#1e262d", border: "1px solid #3d4a56" }}
          >
            <div className="mb-3">
              <p className="font-semibold text-[#e6e0e9]">약 이름 기반 DB 검색 후보</p>
              <p className="mt-1 text-xs text-[#948e9c]">
                {pendingLookup ? "후보를 찾는 중입니다." : lookupMessage || "OCR 정보가 부족하면 후보를 적용한 뒤 실제 포장·처방전과 다시 대조하세요."}
              </p>
              {lookupStatus !== "empty" && (
                <span
                  className="mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: "rgba(207,188,255,0.1)", color: "#cfbcff", border: "1px solid rgba(207,188,255,0.25)" }}
                >
                  {lookupStatus}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {lookupResults.map((result) => (
                <div
                  key={result.id}
                  className="rounded-xl p-3"
                  style={{ background: "#141218", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-[#e6e0e9]">{result.productName}</p>
                      <p className="mt-1 text-xs text-[#cbc4d2]">
                        성분: {formatIngredients(result.ingredients)}
                      </p>
                      <p className="mt-0.5 text-xs text-[#cbc4d2]">
                        용량: {result.dosage ?? "제품 이미지 또는 처방전에서 확인 필요"}
                      </p>
                      <p className="mt-0.5 text-xs text-[#948e9c]">
                        매칭: {result.matchedName} · 점수 {result.score}
                      </p>
                      <p className="mt-0.5 text-xs text-[#948e9c]">
                        출처: {result.lookupSource.providerName} · {new Date(result.lookupSource.checkedAt).toLocaleString("ko-KR")}
                      </p>
                    </div>
                    <button
                      data-testid={`apply-medication-${result.id}`}
                      type="button"
                      className="secondary-button px-3 text-xs"
                      onClick={() => applyMedicationLookup(result)}
                    >
                      {pendingApply?.id === result.id ? "한 번 더 눌러 적용" : "성분·용량 적용"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {parseCompoundIngredients({ ingredientName: value.ingredientName, dosage: value.dosage }).length > 1 && (
          <div
            className="rounded-xl p-3 text-sm"
            style={{ background: "#1e262d", border: "1px solid #3d4a56", color: "#cbc4d2" }}
          >
            <p className="mb-2 font-semibold text-[#e6e0e9]">복합 성분으로 분리될 항목</p>
            <ul className="space-y-1">
              {parseCompoundIngredients({ ingredientName: value.ingredientName, dosage: value.dosage }).map((substance) => (
                <li key={substance.ingredientName}>
                  {substance.ingredientName}
                  {substance.dosage ? ` · ${substance.dosage}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        <MedicationForm
          value={value}
          error={error}
          confidence={confidence}
          verifiedFields={verifiedFields}
          onVerifiedChange={setVerifiedFields}
          onChange={(next) => {
            setValue(next);
            setConfidence(buildOcrFieldConfidence({ ...next, confidence: undefined }));
          }}
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}
