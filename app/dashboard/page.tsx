"use client";

import Link from "next/link";
import { FileText, PlusCircle, Shield, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Disclaimer } from "@/components/Disclaimer";
import { EmptyState } from "@/components/EmptyState";
import { TimelineList } from "@/components/TimelineList";
import { RISK_LABELS } from "@/lib/constants";
import { isWithinLastDays } from "@/lib/dateRange";
import { storage } from "@/lib/storage";
import type { AthleteProfile, ExtractedItem, IntakeLog, RiskCheck } from "@/lib/types";

export default function DashboardPage() {
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [risks, setRisks] = useState<RiskCheck[]>([]);
  const [logs, setLogs] = useState<IntakeLog[]>([]);

  useEffect(() => {
    setProfile(storage.getProfile());
    setItems(storage.getExtractedItems());
    setRisks(storage.getRiskChecks());
    setLogs(storage.getIntakeLogs());
  }, []);

  const recentLogs = logs.filter((log) => isWithinLastDays(log.intakeDate, 7));
  const counts = {
    needsCheck: risks.filter((r) => r.riskLevel === "needs_check").length,
    highRisk: risks.filter((r) => r.riskLevel === "high_risk_candidate").length,
    confirmed: risks.filter((r) => r.riskLevel === "confirmed_candidate").length,
    unknown: risks.filter((r) => r.riskLevel === "unknown").length,
  };

  return (
    <main data-testid="dashboard" className="page-shell space-y-4">
      {/* Profile hero */}
      <section className="section-card relative overflow-hidden">
        {/* Subtle gradient backdrop */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{ background: "linear-gradient(135deg, rgba(103,80,164,0.12) 0%, transparent 60%)" }}
          aria-hidden="true"
        />
        <div className="relative">
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", color: "#cfbcff", marginBottom: 8 }}>
            대시보드
          </p>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#e6e0e9]">
                {profile?.name ?? "선수 정보 없음"}
              </h1>
              {profile && (
                <p className="mt-1 text-sm text-[#cbc4d2]">
                  {profile.sport}
                  {profile.teamName ? ` · ${profile.teamName}` : ""}
                  {" · "}{profile.birthDate}
                </p>
              )}
            </div>
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "linear-gradient(135deg, #6750a4, #7c4dff)" }}
            >
              <Shield size={18} className="text-white" />
            </div>
          </div>

          {/* KPI grid */}
          <div className="kpi-grid">
            <div className="metric-card">
              <span>최근 7일 기록</span>
              <strong>{recentLogs.length}</strong>
            </div>
            <div className="metric-card" style={{ borderColor: "rgba(255,180,171,0.25)" }}>
              <span style={{ color: "#ffb4ab" }}>{RISK_LABELS.high_risk_candidate}</span>
              <strong style={{ color: "#ffb4ab" }}>{counts.highRisk}</strong>
            </div>
            <div className="metric-card" style={{ borderColor: "rgba(231,195,101,0.25)" }}>
              <span style={{ color: "#e7c365" }}>{RISK_LABELS.needs_check}</span>
              <strong style={{ color: "#e7c365" }}>{counts.needsCheck}</strong>
            </div>
            <div className="metric-card" style={{ borderColor: "rgba(52,211,153,0.25)" }}>
              <span style={{ color: "#34d399" }}>{RISK_LABELS.confirmed_candidate}</span>
              <strong style={{ color: "#34d399" }}>{counts.confirmed}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Action buttons */}
      <section className="section-card">
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", color: "#948e9c", marginBottom: 12 }}>
          리포트 조회
        </p>
        <div className="space-y-2">
          <Link href="/upload" className="primary-button w-full">
            <PlusCircle size={18} aria-hidden="true" />
            새 기록 추가하기
          </Link>
          <div className="grid grid-cols-3 gap-2">
            <Link data-testid="report-7-button" href="/report?days=7" className="secondary-button px-2">
              <FileText size={15} aria-hidden="true" />
              7일
            </Link>
            <Link data-testid="report-14-button" href="/report?days=14" className="secondary-button px-2">
              <FileText size={15} aria-hidden="true" />
              14일
            </Link>
            <Link data-testid="report-30-button" href="/report?days=30" className="secondary-button px-2">
              <FileText size={15} aria-hidden="true" />
              30일
            </Link>
          </div>
        </div>
      </section>

      {/* Timeline section */}
      <section>
        <div className="flex items-center gap-2 mb-3 px-1">
          <TrendingUp size={15} className="text-[#cfbcff]" />
          <h2 style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.02em", color: "#948e9c", margin: 0 }}>
            복용 기록
          </h2>
          {logs.length > 0 && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: "rgba(207,188,255,0.1)", color: "#cfbcff", fontFamily: "JetBrains Mono, monospace" }}
            >
              {logs.length}
            </span>
          )}
        </div>
        {logs.length === 0 ? (
          <EmptyState message="아직 복용 기록이 없습니다" href="/upload" action="첫 기록 추가하기" />
        ) : (
          <TimelineList logs={logs} items={items} risks={risks} />
        )}
      </section>

      <Disclaimer />
    </main>
  );
}
