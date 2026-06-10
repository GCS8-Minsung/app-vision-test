"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Disclaimer } from "@/components/Disclaimer";
import { IntakeForm } from "@/components/IntakeForm";
import { RiskBadge } from "@/components/RiskBadge";
import { OFFICIAL_CHECK_LINKS, RISK_LABELS, VERIFICATION_LABELS } from "@/lib/constants";
import { createId } from "@/lib/ids";
import { draftStorage, storage } from "@/lib/storage";
import { getSourceUrl } from "@/lib/substanceDatabase";
import type { ExtractedItem, ExtractedSubstance, RiskCheck, VerificationKey } from "@/lib/types";

const RISK_COLORS: Record<string, string> = {
  high_risk_candidate: "rgba(255,180,171,0.08)",
  needs_check: "rgba(231,195,101,0.08)",
  confirmed_candidate: "rgba(52,211,153,0.08)",
  unknown: "rgba(148,142,156,0.08)"
};
const RISK_BORDER: Record<string, string> = {
  high_risk_candidate: "rgba(255,180,171,0.25)",
  needs_check: "rgba(231,195,101,0.25)",
  confirmed_candidate: "rgba(52,211,153,0.25)",
  unknown: "rgba(148,142,156,0.25)"
};
const RISK_TEXT: Record<string, string> = {
  high_risk_candidate: "#ffb4ab",
  needs_check: "#e7c365",
  confirmed_candidate: "#34d399",
  unknown: "#948e9c"
};

export default function ResultPage() {
  const router = useRouter();
  const [item, setItem] = useState<ExtractedItem | null>(null);
  const [risk, setRisk] = useState<RiskCheck | null>(null);
  const [risks, setRisks] = useState<RiskCheck[]>([]);
  const [substances, setSubstances] = useState<ExtractedSubstance[]>([]);

  useEffect(() => {
    const current = draftStorage.getCurrentResult();
    if (!current) return;
    setItem(storage.getExtractedItems().find((c) => c.id === current.itemId) ?? null);
    setRisk(storage.getRiskChecks().find((c) => c.id === current.riskId) ?? null);
    setRisks(storage.getRiskChecks().filter((c) => c.itemId === current.itemId));
    setSubstances(storage.getExtractedSubstances().filter((c) => c.itemId === current.itemId));
  }, []);

  if (!item || !risk) {
    return (
      <main className="page-shell">
        <section className="section-card">
          <h1 className="text-xl font-bold text-[#e6e0e9]">표시할 분석 결과가 없습니다.</h1>
          <button type="button" className="primary-button mt-4" onClick={() => router.push("/upload")}>
            새 기록 추가
          </button>
        </section>
      </main>
    );
  }

  const color = RISK_TEXT[risk.riskLevel] ?? "#cbc4d2";

  return (
    <main className="page-shell">
      {/* Risk result card */}
      <section className="section-card space-y-4">
        <div>
          <RiskBadge riskLevel={risk.riskLevel} compact />
          <h1 className="mt-3 text-2xl font-bold text-[#e6e0e9]">
            {RISK_LABELS[risk.riskLevel]}
          </h1>
          <p className="text-sm text-[#cbc4d2] mt-0.5">{item.itemName}</p>
        </div>

        <p className="leading-7 text-[#cbc4d2] text-sm">{risk.riskReason}</p>

        <div
          className="rounded-xl p-3 text-sm font-medium leading-6"
          style={{
            background: RISK_COLORS[risk.riskLevel] ?? "rgba(148,142,156,0.08)",
            border: `1px solid ${RISK_BORDER[risk.riskLevel] ?? "rgba(148,142,156,0.25)"}`,
            color
          }}
        >
          {risk.recommendedAction}
        </div>

        {risk.databaseMatch && (
          <div
            className="rounded-xl p-3 text-sm leading-6"
            style={{ background: "#1e262d", border: "1px solid #3d4a56" }}
          >
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", color: "#cfbcff", marginBottom: 6 }}>
              DB 매칭 근거
            </p>
            <p className="text-[#cbc4d2]">성분 후보: {risk.databaseMatch.substanceName}</p>
            <p className="text-[#cbc4d2]">분류: {risk.databaseMatch.wadaClass}</p>
            <p className="text-[#cbc4d2]">DB 버전: {risk.databaseMatch.databaseVersion}</p>
            {risk.databaseMatch.matchedTerm && (
              <p className="text-[#cbc4d2]">매칭 기준: {risk.databaseMatch.matchedTerm}</p>
            )}
            {risk.databaseMatch.productAlias && (
              <p className="text-[#cbc4d2]">제품명 alias: {risk.databaseMatch.productAlias}</p>
            )}
            <p className="text-[#cbc4d2]">출처: {risk.databaseMatch.sourceNames.join(", ")}</p>
          </div>
        )}

        {risks.length > 1 && (
          <div
            className="rounded-xl p-3 text-sm leading-6"
            style={{ background: "#1e262d", border: "1px solid #3d4a56" }}
          >
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", color: "#cfbcff", marginBottom: 6 }}>
              성분별 확인 결과
            </p>
            <div className="space-y-3">
              {risks.map((candidate) => {
                const substance = substances.find((entry) => entry.id === candidate.substanceId);
                return (
                  <div key={candidate.id} className="rounded-lg p-3" style={{ background: "#141218" }}>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <RiskBadge riskLevel={candidate.riskLevel} compact />
                      <span className="font-semibold text-[#e6e0e9]">
                        {substance?.ingredientName ?? candidate.databaseMatch?.substanceName ?? item.ingredientName}
                      </span>
                    </div>
                    {substance?.dosage && <p className="text-[#cbc4d2]">용량: {substance.dosage}</p>}
                    {candidate.databaseMatch?.matchedTerm && (
                      <p className="text-[#948e9c]">매칭 기준: {candidate.databaseMatch.matchedTerm}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {item.userVerifiedFields && item.userVerifiedFields.length > 0 && (
          <div
            className="rounded-xl p-3 text-sm leading-6"
            style={{ background: "#1e262d", border: "1px solid #3d4a56" }}
          >
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", color: "#cfbcff", marginBottom: 6 }}>
              사용자 확인 기록
            </p>
            <div className="flex flex-wrap gap-2">
              {item.userVerifiedFields.map((key) => (
                <span
                  key={key}
                  className="rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ background: "rgba(207,188,255,0.1)", color: "#cfbcff", border: "1px solid rgba(207,188,255,0.25)" }}
                >
                  {VERIFICATION_LABELS[key as VerificationKey]}
                </span>
              ))}
            </div>
          </div>
        )}

        <div
          className="rounded-xl p-3 text-sm leading-6"
          style={{ background: "#1e262d", border: "1px solid #3d4a56" }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", color: "#cfbcff", marginBottom: 6 }}>
            확인 링크
          </p>
          <div className="flex flex-wrap gap-2">
            {OFFICIAL_CHECK_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: "rgba(207,188,255,0.1)", color: "#cfbcff", border: "1px solid rgba(207,188,255,0.25)" }}
              >
                {link.label}
              </a>
            ))}
            {risk.databaseMatch?.sourceNames
              .map((source) => ({ source, href: getSourceUrl(source) }))
              .filter((source): source is { source: string; href: string } => Boolean(source.href))
              .map((source) => (
                <a
                  key={source.source}
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: "rgba(231,195,101,0.1)", color: "#e7c365", border: "1px solid rgba(231,195,101,0.25)" }}
                >
                  {source.source}
                </a>
              ))}
          </div>
        </div>

        <Disclaimer />
      </section>

      {/* Intake log section */}
      <section className="section-card mt-4">
        <h2 className="font-semibold text-[#e6e0e9] mb-4">복용 기록 추가</h2>
        <IntakeForm
          defaultDosage={item.dosage}
          onSave={(value) => {
            const profile = storage.getProfile();
            if (!profile) { router.push("/onboarding"); return; }
            storage.saveIntakeLog({
              id: createId("log"),
              userId: profile.id,
              itemId: item.id,
              intakeStatus: value.intakeStatus,
              isCompetitionPeriod: value.isCompetitionPeriod,
              intakeDate: value.intakeDate,
              intakeTime: value.intakeTime,
              dosage: value.dosage.trim() || undefined,
              note: value.note.trim() || undefined,
              createdAt: new Date().toISOString()
            });
            router.push("/dashboard");
          }}
        />
      </section>
    </main>
  );
}
