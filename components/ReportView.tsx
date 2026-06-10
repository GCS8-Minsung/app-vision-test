import Image from "next/image";
import { RISK_LABELS, VERIFICATION_LABELS } from "@/lib/constants";
import type { ReportData } from "@/lib/types";
import { Disclaimer } from "./Disclaimer";
import { RiskBadge } from "./RiskBadge";

export function ReportView({ report }: { report: ReportData }) {
  return (
    <section data-testid="report-view" className="space-y-5 print:space-y-4">
      {/* Profile header */}
      <div className="section-card print:bg-white print:shadow-none">
        <p
          className="text-[10px] font-medium uppercase tracking-widest mb-1"
          style={{ fontFamily: "JetBrains Mono, monospace", color: "#cfbcff" }}
        >
          {report.days}일 리포트
        </p>
        <h1 className="text-2xl font-bold text-[#e6e0e9]">{report.profile.name}</h1>
        <p className="mt-1.5 text-sm text-[#cbc4d2]">
          {report.profile.birthDate} · {report.profile.sport}
          {report.profile.teamName ? ` · ${report.profile.teamName}` : ""}
        </p>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="metric-card">
          <span>총 기록</span>
          <strong>{report.items.length}</strong>
        </div>
        <div className="metric-card" style={{ borderColor: "rgba(255,180,171,0.3)" }}>
          <span style={{ color: "#ffb4ab" }}>{RISK_LABELS.high_risk_candidate}</span>
          <strong style={{ color: "#ffb4ab" }}>{report.counts.high_risk_candidate}</strong>
        </div>
        <div className="metric-card" style={{ borderColor: "rgba(231,195,101,0.3)" }}>
          <span style={{ color: "#e7c365" }}>{RISK_LABELS.needs_check}</span>
          <strong style={{ color: "#e7c365" }}>{report.counts.needs_check}</strong>
        </div>
        <div className="metric-card">
          <span>{RISK_LABELS.unknown}</span>
          <strong>{report.counts.unknown}</strong>
        </div>
      </div>

      {/* Item list */}
      {report.items.length === 0 ? (
        <div
          className="rounded-2xl p-6 text-center text-[#cbc4d2]"
          style={{ background: "#303b45", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          해당 기간에 표시할 기록이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {report.items.map(({ log, item, risk, risks, substances, upload }) => (
            <article
              key={log.id}
              className="rounded-2xl p-4 print:bg-white print:shadow-none"
              style={{
                background: "#303b45",
                border: "1px solid rgba(255,255,255,0.06)"
              }}
            >
              <div className="flex gap-4">
                {upload?.imageDataUrl && (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[#1e262d]">
                    <Image
                      src={upload.imageDataUrl}
                      alt="업로드 이미지 썸네일"
                      fill
                      className="object-cover opacity-80"
                      unoptimized
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <h2 className="font-semibold text-[#e6e0e9]">
                      {item?.itemName ?? "이름 없는 기록"}
                    </h2>
                    {risk && <RiskBadge riskLevel={risk.riskLevel} compact />}
                  </div>
                  <p className="text-xs text-[#cbc4d2]">
                    성분명: {substances.length > 0 ? substances.map((substance) => substance.ingredientName).join(" + ") : item?.ingredientName || "미입력"}
                  </p>
                  <p className="mt-0.5 text-xs text-[#cbc4d2]">
                    용량: {log.dosage || item?.dosage || "미입력"}
                  </p>
                  <p className="mt-0.5 text-xs text-[#948e9c]">
                    {log.intakeDate} {log.intakeTime}
                  </p>
                  <p className="mt-0.5 text-xs text-[#948e9c]">
                    경기기간: {log.isCompetitionPeriod ? "예" : "아니오"}
                  </p>
                  {risk?.databaseMatch && (
                    <p className="mt-0.5 text-xs text-[#948e9c]">
                      DB 매칭: {risk.databaseMatch.substanceName} · {risk.databaseMatch.wadaClass}
                    </p>
                  )}
                  {risks.length > 1 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {risks.map((candidate) => (
                        <span
                          key={candidate.id}
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: "#1e262d", color: "#cbc4d2", border: "1px solid #3d4a56" }}
                        >
                          {candidate.databaseMatch?.substanceName ?? "성분"} · {RISK_LABELS[candidate.riskLevel]}
                        </span>
                      ))}
                    </div>
                  )}
                  {item?.userVerifiedFields && item.userVerifiedFields.length > 0 && (
                    <p className="mt-2 text-xs text-[#948e9c]">
                      사용자 확인: {item.userVerifiedFields.map((key) => VERIFICATION_LABELS[key]).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Disclaimer />
    </section>
  );
}
