"use client";

import type { FormEvent } from "react";

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

export function MedicationForm({
  value,
  error,
  onChange,
  onSubmit
}: {
  value: MedicationFormValue;
  error?: string;
  onChange: (next: MedicationFormValue) => void;
  onSubmit: () => void;
}) {
  function update<K extends keyof MedicationFormValue>(key: K, v: MedicationFormValue[K]) {
    onChange({ ...value, [key]: v });
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
        required
      />
      <Field
        id="ingredientName"
        label="성분명"
        value={value.ingredientName}
        onChange={(v) => update("ingredientName", v)}
        badge={
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
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          id="dosage"
          label="용량"
          value={value.dosage}
          onChange={(v) => update("dosage", v)}
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
