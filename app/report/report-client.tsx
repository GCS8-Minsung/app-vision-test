"use client";

import { Check, ClipboardCopy, Download, Printer, Share2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ReportView } from "@/components/ReportView";
import { RISK_LABELS } from "@/lib/constants";
import { buildReportData } from "@/lib/report";
import { storage, syncStorageWithSupabase } from "@/lib/storage";
import type { ReportData, RiskLevel } from "@/lib/types";

function parseDays(value: string | null): 7 | 14 | 30 {
  if (value === "14") return 14;
  if (value === "30") return 30;
  return 7;
}

export function ReportClient() {
  const searchParams = useSearchParams();
  const [report, setReport] = useState<ReportData | null>(null);
  const [copied, setCopied] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const profile = storage.getProfile();
      if (!profile) return;
      await syncStorageWithSupabase(profile.id);
      if (cancelled) return;
      const hydratedProfile = storage.getProfile() ?? profile;
      setReport(
        buildReportData({
          profile: hydratedProfile,
          items: storage.getExtractedItems(),
          risks: storage.getRiskChecks(),
          logs: storage.getIntakeLogs(),
          uploads: storage.getUploads(),
          substances: storage.getExtractedSubstances(),
          days: parseDays(searchParams?.get("days") ?? null)
        })
      );
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const visibleReport = report
    ? {
        ...report,
        items: riskFilter === "all"
          ? report.items
          : report.items.filter((item) => item.risks.some((risk) => risk.riskLevel === riskFilter))
      }
    : null;

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
  }

  function toCsvValue(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
  }

  function downloadCsv() {
    if (!visibleReport) return;
    const rows = [
      ["날짜", "시간", "약 이름", "성분명", "성분 함량", "복용량", "위험 상태", "상호작용/위험 신호", "부작용", "사용자 확인"].map(toCsvValue).join(","),
      ...visibleReport.items.map(({ log, item, risk, substances }) =>
        [
          log.intakeDate,
          log.intakeTime,
          item?.itemName ?? "",
          item?.ingredients?.length
            ? item.ingredients.map((ingredient) => ingredient.name).join(" + ")
            : substances.length > 0
              ? substances.map((substance) => substance.ingredientName).join(" + ")
              : item?.ingredientName ?? "",
          item?.dosage || log.dosage || "",
          log.intakeAmount || item?.intakeAmount || "",
          risk ? RISK_LABELS[risk.riskLevel] : "",
          item?.interactionWarnings ?? "",
          item?.sideEffects ?? "",
          item?.userVerifiedFields?.length ? String(item.userVerifiedFields.length) : "0"
        ].map(toCsvValue).join(",")
      )
    ];
    const blob = new Blob([`\uFEFF${rows.join("\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `doping-note-report-${visibleReport.days}d.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function copySummary() {
    if (!visibleReport) return;
    const summary = [
      `${visibleReport.days}일 리포트 요약`,
      `선수: ${visibleReport.profile.name}`,
      `총 기록: ${visibleReport.items.length}`,
      `${RISK_LABELS.high_risk_candidate}: ${visibleReport.counts.high_risk_candidate}`,
      `${RISK_LABELS.needs_check}: ${visibleReport.counts.needs_check}`,
      `${RISK_LABELS.unknown}: ${visibleReport.counts.unknown}`
    ].join("\n");
    await navigator.clipboard.writeText(summary);
    setSummaryCopied(true);
  }

  return (
    <main className="page-shell">
      <div className="no-print mb-4 grid gap-3 md:grid-cols-4">
        <label className="block">
          <span className="form-label">위험 상태 필터</span>
          <select
            className="form-input"
            value={riskFilter}
            onChange={(event) => setRiskFilter(event.target.value as RiskLevel | "all")}
          >
            <option value="all">전체</option>
            {(Object.keys(RISK_LABELS) as RiskLevel[]).map((level) => (
              <option key={level} value={level}>{RISK_LABELS[level]}</option>
            ))}
          </select>
        </label>
        <button
          data-testid="copy-share-link"
          type="button"
          className="secondary-button"
          onClick={copyLink}
        >
          {copied ? <Check size={18} aria-hidden="true" /> : <Share2 size={18} aria-hidden="true" />}
          공유 링크 복사
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={copySummary}
        >
          {summaryCopied ? <Check size={18} aria-hidden="true" /> : <ClipboardCopy size={18} aria-hidden="true" />}
          요약 복사
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={downloadCsv}
        >
          <Download size={18} aria-hidden="true" />
          CSV 저장
        </button>
        <button
          data-testid="print-report"
          type="button"
          className="secondary-button"
          onClick={() => window.print()}
        >
          <Printer size={18} aria-hidden="true" />
          PDF로 저장하기
        </button>
      </div>

      {visibleReport ? (
        <ReportView report={visibleReport} />
      ) : (
        <section data-testid="report-view" className="section-card">
          <h1 className="text-xl font-bold text-[#e6e0e9]">
            리포트를 만들 선수 정보가 없습니다.
          </h1>
          <p className="mt-2 text-sm text-[#cbc4d2]">
            온보딩을 통해 선수 정보를 먼저 입력해주세요.
          </p>
        </section>
      )}
    </main>
  );
}
