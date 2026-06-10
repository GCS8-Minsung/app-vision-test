"use client";

import clsx from "clsx";
import { CalendarDays, Clock, Flag, Save } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { INTAKE_STATUS_LABELS } from "@/lib/constants";
import type { IntakeStatus } from "@/lib/types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function currentTime() {
  return new Date().toTimeString().slice(0, 5);
}

const OPTIONS: { status: IntakeStatus; testId: string }[] = [
  { status: "not_taken", testId: "intake-status-not-taken" },
  { status: "taken", testId: "intake-status-taken" },
  { status: "planned", testId: "intake-status-planned" }
];

export function IntakeForm({
  defaultDosage,
  onSave
}: {
  defaultDosage?: string;
  onSave: (value: {
    intakeStatus: IntakeStatus;
    isCompetitionPeriod: boolean;
    intakeDate: string;
    intakeTime: string;
    dosage: string;
    note: string;
  }) => void;
}) {
  const [status, setStatus] = useState<IntakeStatus>("not_taken");
  const [date, setDate] = useState(today());
  const [time, setTime] = useState(currentTime());
  const [isCompetitionPeriod, setIsCompetitionPeriod] = useState(false);
  const [dosage, setDosage] = useState(defaultDosage ?? "");
  const [note, setNote] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSave({ intakeStatus: status, isCompetitionPeriod, intakeDate: date, intakeTime: time, dosage, note });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Status selector */}
      <fieldset>
        <legend
          className="mb-3 text-sm font-semibold text-[#e6e0e9]"
        >
          이 약/보충제를 복용했나요?
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {OPTIONS.map((opt) => (
            <button
              key={opt.status}
              data-testid={opt.testId}
              type="button"
              onClick={() => setStatus(opt.status)}
              className={clsx(
                "min-h-12 rounded-xl border text-sm font-semibold transition-all",
                status === opt.status
                  ? "text-[#cfbcff]"
                  : "text-[#948e9c] hover:text-[#cbc4d2]"
              )}
              style={
                status === opt.status
                  ? {
                      background: "rgba(207, 188, 255, 0.12)",
                      border: "1px solid rgba(207, 188, 255, 0.4)"
                    }
                  : {
                      background: "#1e262d",
                      border: "1px solid #3d4a56"
                    }
              }
            >
              {INTAKE_STATUS_LABELS[opt.status]}
            </button>
          ))}
        </div>
      </fieldset>

      <label
        className="flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl p-4 text-sm"
        style={{ background: "#1e262d", border: "1px solid #3d4a56" }}
      >
        <input
          data-testid="competition-period-checkbox"
          type="checkbox"
          className="mt-1 size-4 accent-[#7c4dff]"
          checked={isCompetitionPeriod}
          onChange={(event) => setIsCompetitionPeriod(event.target.checked)}
        />
        <span className="flex-1">
          <span className="flex items-center gap-2 font-semibold text-[#e6e0e9]">
            <Flag size={15} aria-hidden="true" />
            복용 시점이 경기기간입니다
          </span>
          <span className="mt-1 block text-xs leading-5 text-[#948e9c]">
            경기기간 조건에 따라 기준이 달라질 수 있어 리포트에 함께 저장합니다.
          </span>
        </span>
      </label>

      {/* Date + Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="intakeDate" className="form-label">날짜</label>
          <div className="relative">
            <CalendarDays
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#948e9c]"
            />
            <input
              id="intakeDate"
              className="form-input pl-9"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="intakeTime" className="form-label">시간</label>
          <div className="relative">
            <Clock
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#948e9c]"
            />
            <input
              id="intakeTime"
              className="form-input pl-9"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Dosage */}
      <div>
        <label htmlFor="intakeDosage" className="form-label">용량</label>
        <input
          id="intakeDosage"
          className="form-input"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
        />
      </div>

      {/* Note */}
      <div>
        <label htmlFor="intakeNote" className="form-label">메모</label>
        <textarea
          id="intakeNote"
          className="form-input min-h-24 resize-none"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <button data-testid="intake-save" type="submit" className="primary-button w-full">
        <Save size={16} aria-hidden="true" />
        복용 기록 저장
      </button>
    </form>
  );
}
