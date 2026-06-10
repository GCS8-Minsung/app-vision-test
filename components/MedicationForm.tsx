"use client";

import type { FormEvent } from "react";
import { VERIFICATION_LABELS } from "@/lib/constants";
import type { OcrFieldConfidence, VerificationKey } from "@/lib/types";

export interface MedicationFormValue {
  itemName: string;
  ingredientName: string;
  dosage: string;
  hospitalName: string;
  conditionName: string;
}

function Field({
  id,
  label,
  value,
  onChange,
  required,
  badge
}: {
  id: keyof MedicationFormValue;
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={id} className="form-label">{label}</label>
        {badge}
      </div>
      <input
        id={id}
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}

const CONFIDENCE_LABELS = {
  high: "신뢰 높음",
  medium: "확인 권장",
  low: "직접 확인",
  missing: "미인식"
} as const;

const CONFIDENCE_COLORS = {
  high: { color: "#34d399", background: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.3)" },
  medium: { color: "#e7c365", background: "rgba(231,195,101,0.1)", border: "rgba(231,195,101,0.3)" },
  low: { color: "#ffb4ab", background: "rgba(255,180,171,0.1)", border: "rgba(255,180,171,0.3)" },
  missing: { color: "#948e9c", background: "rgba(148,142,156,0.1)", border: "rgba(148,142,156,0.3)" }
} as const;

function ConfidenceBadge({ value }: { value?: OcrFieldConfidence[keyof OcrFieldConfidence] }) {
  if (!value) return null;
  const colors = CONFIDENCE_COLORS[value];

  return (
    <span
      className="rounded-full px-2 py-0.5 text-[9px] font-bold"
      style={{ color: colors.color, background: colors.background, border: `1px solid ${colors.border}` }}
    >
      {CONFIDENCE_LABELS[value]}
    </span>
  );
}

export function MedicationForm({
  value,
  error,
  confidence,
  verifiedFields,
  onChange,
  onVerifiedChange,
  onSubmit
}: {
  value: MedicationFormValue;
  error?: string;
  confidence?: OcrFieldConfidence;
  verifiedFields?: VerificationKey[];
  onChange: (next: MedicationFormValue) => void;
  onVerifiedChange?: (next: VerificationKey[]) => void;
  onSubmit: () => void;
}) {
  function update<K extends keyof MedicationFormValue>(key: K, v: MedicationFormValue[K]) {
    onChange({ ...value, [key]: v });
  }

  function toggleVerification(key: VerificationKey) {
    if (!verifiedFields || !onVerifiedChange) return;
    onVerifiedChange(
      verifiedFields.includes(key)
        ? verifiedFields.filter((candidate) => candidate !== key)
        : [...verifiedFields, key]
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form data-testid="review-form" onSubmit={handleSubmit} className="space-y-4">
      <Field
        id="itemName"
        label="약 이름/제품명"
        value={value.itemName}
        onChange={(v) => update("itemName", v)}
        badge={<ConfidenceBadge value={confidence?.itemName} />}
        required
      />
      <Field
        id="ingredientName"
        label="성분명"
        value={value.ingredientName}
        onChange={(v) => update("ingredientName", v)}
        badge={
          <div className="flex items-center gap-1">
            <ConfidenceBadge value={confidence?.ingredientName} />
            <span
              className="text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5"
              style={{
                background: "rgba(255,180,171,0.15)",
                color: "#ffb4ab",
                border: "1px solid rgba(255,180,171,0.3)",
                fontFamily: "JetBrains Mono, monospace"
              }}
            >
              중요
            </span>
          </div>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          id="dosage"
          label="용량"
          value={value.dosage}
          onChange={(v) => update("dosage", v)}
          badge={<ConfidenceBadge value={confidence?.dosage} />}
        />
        <Field
          id="hospitalName"
          label="병원명"
          value={value.hospitalName}
          onChange={(v) => update("hospitalName", v)}
        />
      </div>
      <Field
        id="conditionName"
        label="질환명/복용 목적"
        value={value.conditionName}
        onChange={(v) => update("conditionName", v)}
      />

      {verifiedFields && onVerifiedChange && (
        <fieldset
          className="rounded-2xl p-4"
          style={{ background: "#1e262d", border: "1px solid #3d4a56" }}
        >
          <legend className="mb-3 text-sm font-semibold text-[#e6e0e9]">
            사용자 확인 체크리스트
          </legend>
          <div className="space-y-2">
            {(Object.keys(VERIFICATION_LABELS) as VerificationKey[]).map((key) => (
              <label key={key} className="flex min-h-10 cursor-pointer items-center gap-3 text-sm text-[#cbc4d2]">
                <input
                  type="checkbox"
                  className="size-4 accent-[#7c4dff]"
                  checked={verifiedFields.includes(key)}
                  onChange={() => toggleVerification(key)}
                />
                {VERIFICATION_LABELS[key]}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {error && (
        <p className="text-sm font-semibold" style={{ color: "#ffb4ab" }}>
          {error}
        </p>
      )}

      <button data-testid="review-submit" type="submit" className="primary-button w-full mt-2">
        이 정보로 확인하기
      </button>
    </form>
  );
}
